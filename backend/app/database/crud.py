from sqlalchemy.orm import Session
from . import models

# User CRUD
def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, hashed_pw: str, role: str = "user"):
    db_user = models.User(username=username, hashed_password=hashed_pw, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: int, full_name: str = None, username: str = None, hashed_password: str = None):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    if full_name is not None:
        db_user.full_name = full_name
    if username is not None:
        db_user.username = username
    if hashed_password is not None:
        db_user.hashed_password = hashed_password
    db.commit()
    db.refresh(db_user)
    return db_user

def deduct_user_credit(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user and db_user.subscription == "free" and db_user.credits > 0:
        db_user.credits -= 1
        db.commit()
        db.refresh(db_user)
    return db_user


# Prediction Log CRUD
def create_prediction_log(db: Session, team1: str, team2: str, venue: str, 
                          toss_winner: str, toss_decision: str, predicted_winner: str, 
                          win_probability: float, model_used: str, explanation_summary: str = None, 
                          user_id: int = None):
    db_log = models.PredictionLog(
        user_id=user_id,
        team1=team1,
        team2=team2,
        venue=venue,
        toss_winner=toss_winner,
        toss_decision=toss_decision,
        predicted_winner=predicted_winner,
        win_probability=win_probability,
        model_used=model_used,
        explanation_summary=explanation_summary
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_predictions_by_user(db: Session, user_id: int, limit: int = 50):
    return db.query(models.PredictionLog)\
             .filter(models.PredictionLog.user_id == user_id)\
             .order_by(models.PredictionLog.created_at.desc())\
             .limit(limit)\
             .all()

def get_all_prediction_logs(db: Session, limit: int = 100):
    return db.query(models.PredictionLog)\
             .order_by(models.PredictionLog.created_at.desc())\
             .limit(limit)\
             .all()

# Model Metrics CRUD
def create_model_metric(db: Session, retrained_on: str, dataset_version: str, 
                        roc_auc_pre_match: float, roc_auc_live_chase: float, run_id: str):
    db_metric = models.ModelMetric(
        retrained_on=retrained_on,
        dataset_version=dataset_version,
        roc_auc_pre_match=roc_auc_pre_match,
        roc_auc_live_chase=roc_auc_live_chase,
        run_id=run_id
    )
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

def get_latest_model_metric(db: Session):
    return db.query(models.ModelMetric)\
             .order_by(models.ModelMetric.created_at.desc())\
             .first()

# Billing Transactions CRUD
def create_billing_transaction(db: Session, user_id: int, order_id: str, amount: float, plan_name: str):
    db_tx = models.BillingTransaction(
        user_id=user_id,
        order_id=order_id,
        amount=amount,
        plan_name=plan_name,
        status="created"
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx

def update_billing_transaction_status(db: Session, order_id: str, payment_id: str, status: str):
    db_tx = db.query(models.BillingTransaction).filter(models.BillingTransaction.order_id == order_id).first()
    if db_tx:
        db_tx.payment_id = payment_id
        db_tx.status = status
        db.commit()
        db.refresh(db_tx)
    return db_tx

def upgrade_user_subscription(db: Session, user_id: int, subscription: str, credits: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.subscription = subscription
        db_user.credits = credits
        db.commit()
        db.refresh(db_user)
    return db_user

def get_billing_history_by_user(db: Session, user_id: int, limit: int = 50):
    return db.query(models.BillingTransaction)\
             .filter(models.BillingTransaction.user_id == user_id)\
             .order_by(models.BillingTransaction.created_at.desc())\
             .limit(limit)\
             .all()

def delete_user_by_id(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Admin Payment Verification CRUD
def get_pending_billing_transactions(db: Session):
    return db.query(models.BillingTransaction)\
             .filter(models.BillingTransaction.status == "pending_verification")\
             .order_by(models.BillingTransaction.created_at.desc())\
             .all()

def get_billing_transaction_by_id(db: Session, tx_id: int):
    return db.query(models.BillingTransaction)\
             .filter(models.BillingTransaction.id == tx_id)\
             .first()

def check_duplicate_payment_id(db: Session, payment_id: str):
    return db.query(models.BillingTransaction)\
             .filter(models.BillingTransaction.payment_id == payment_id)\
             .filter(models.BillingTransaction.status.in_(["captured", "pending_verification"]))\
             .first()

