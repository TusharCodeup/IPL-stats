import logging
import json
import pandas as pd
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session
from ...database import connection, crud
from ...core.config import settings
from ...ml.data_pipeline import preprocess_and_consolidate
from ...ml.train import train_and_evaluate_models
from ...ml.ensemble import predictor
from ...ml.data_drift import check_data_drift
from .auth import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter()

def run_retraining_task(db_session_factory):
    """Executes the data pipeline and model retraining, and saves results to DB."""
    db = db_session_factory()
    try:
        logger.info("Background retraining task started...")
        # 1. Download and extract
        preprocess_and_consolidate()
        # 2. Train models
        train_and_evaluate_models()
        # 3. Reload in-memory models
        predictor.load_models()
        
        # 4. Save metrics to Database
        metadata_path = settings.MODELS_DIR / "metadata.json"
        if metadata_path.exists():
            with open(metadata_path, 'r', encoding='utf-8') as f:
                meta = json.load(f)
            
            # Read latest run ID from MLflow if available, else standard fallback
            run_id = meta.get("mlflow_run_id", "local_run")
            
            crud.create_model_metric(
                db=db,
                retrained_on=meta["trained_on"],
                dataset_version=meta["dataset_version"],
                roc_auc_pre_match=meta["roc_auc_pre_match"],
                roc_auc_live_chase=meta["roc_auc_live_chase"],
                run_id=run_id
            )
            logger.info("Model metrics saved to DB successfully.")
            
        logger.info("Background retraining task completed successfully.")
    except Exception as e:
        logger.error(f"Error during background retraining task: {e}")
    finally:
        db.close()

@router.post("/retrain", status_code=status.HTTP_202_ACCEPTED)
def retrain_models(
    background_tasks: BackgroundTasks,
    current_admin = Depends(get_current_admin)
):
    """
    Triggers model retraining in the background. Accessible only by Administrators.
    """
    # Enqueue retraining in FastAPI background tasks
    # We pass the SessionLocal factory so the background thread creates its own session
    background_tasks.add_task(run_retraining_task, connection.SessionLocal)
    return {"status": "retraining_initiated", "message": "Model retraining pipeline enqueued in background."}

@router.get("/metrics")
def get_model_metrics(
    db: Session = Depends(connection.get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Returns latest training and evaluation metrics from the database or metadata.json.
    """
    latest_db = crud.get_latest_model_metric(db)
    metadata_path = settings.MODELS_DIR / "metadata.json"
    
    if metadata_path.exists():
        with open(metadata_path, 'r', encoding='utf-8') as f:
            meta = json.load(f)
        return {
            "source": "file_metadata",
            "trained_on": meta.get("trained_on"),
            "dataset_version": meta.get("dataset_version"),
            "roc_auc_pre_match": meta.get("roc_auc_pre_match"),
            "roc_auc_live_chase": meta.get("roc_auc_live_chase"),
            "accuracy_pre_match": meta.get("accuracy_pre_match"),
            "accuracy_live_chase": meta.get("accuracy_live_chase"),
            "features_pre_match": meta.get("features_pre_match"),
            "features_live_chase": meta.get("features_live_chase")
        }
    elif latest_db:
        return {
            "source": "db_metrics",
            "trained_on": latest_db.retrained_on,
            "dataset_version": latest_db.dataset_version,
            "roc_auc_pre_match": latest_db.roc_auc_pre_match,
            "roc_auc_live_chase": latest_db.roc_auc_live_chase,
            "run_id": latest_db.run_id
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No training metrics are available. Please trigger model retraining."
        )

@router.get("/drift")
def get_data_drift_report(
    current_admin = Depends(get_current_admin)
):
    """
    Performs data drift detection between historical seasons (2008-2021) 
    and recent seasons (2022+).
    Analyzes mean target scores and home win rates to identify domain shifts.
    """
    report = check_data_drift()
    if report.get("status") == "error":
        raise HTTPException(status_code=500, detail=report.get("message"))
    elif report.get("status") == "insufficient_data":
        raise HTTPException(status_code=400, detail=report.get("message"))
    return report

@router.get("/pending-payments")
def get_pending_payments(
    db: Session = Depends(connection.get_db),
    current_admin = Depends(get_current_admin)
):
    """Returns all UPI transactions awaiting admin verification."""
    pending = crud.get_pending_billing_transactions(db)
    return [
        {
            "id": tx.id,
            "user_id": tx.user_id,
            "username": tx.user.username if tx.user else "unknown",
            "order_id": tx.order_id,
            "payment_id": tx.payment_id,
            "amount": tx.amount,
            "plan_name": tx.plan_name,
            "status": tx.status,
            "created_at": tx.created_at.isoformat() if tx.created_at else None
        }
        for tx in pending
    ]

@router.post("/approve-payment/{tx_id}")
def approve_payment(
    tx_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(connection.get_db),
    current_admin = Depends(get_current_admin)
):
    """Admin approves a pending UPI payment, upgrading the user to Pro."""
    tx = crud.get_billing_transaction_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    if tx.status != "pending_verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction is already '{tx.status}', cannot approve."
        )
    
    # Mark as captured
    tx.status = "captured"
    db.commit()
    db.refresh(tx)
    
    # Upgrade user
    crud.upgrade_user_subscription(db=db, user_id=tx.user_id, subscription="pro", credits=9999)
    
    # Trigger n8n notification
    user = crud.get_user_by_id(db, user_id=tx.user_id)
    if user and settings.N8N_WEBHOOK_URL:
        from .billing import send_n8n_post_purchase_notification
        background_tasks.add_task(
            send_n8n_post_purchase_notification,
            user.username, tx.amount, tx.payment_id, tx.plan_name
        )
    
    logger.info(f"Admin approved payment #{tx_id} for user {user.username if user else tx.user_id}")
    return {
        "message": f"Payment approved. User '{user.username if user else tx.user_id}' upgraded to Pro.",
        "status": "approved"
    }

@router.post("/reject-payment/{tx_id}")
def reject_payment(
    tx_id: int,
    db: Session = Depends(connection.get_db),
    current_admin = Depends(get_current_admin)
):
    """Admin rejects a fraudulent or invalid UPI payment submission."""
    tx = crud.get_billing_transaction_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    if tx.status != "pending_verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction is already '{tx.status}', cannot reject."
        )
    
    tx.status = "rejected"
    db.commit()
    
    logger.info(f"Admin rejected payment #{tx_id}")
    return {"message": "Payment rejected.", "status": "rejected"}
