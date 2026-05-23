from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...database import connection, crud, models
from ...ml.train import train_and_evaluate_models
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class N8NActionRequest(BaseModel):
    action: str  # 'reset_credits', 'get_stats', 'retrain_model'
    username: Optional[str] = None
    credits: Optional[int] = 5

@router.post("/action")
def handle_n8n_webhook_action(
    request: N8NActionRequest,
    db: Session = Depends(connection.get_db)
):
    """
    Public API endpoint to handle actions posted from n8n automation workflows,
    such as credit refills, stats queries, or pipeline retraining triggers.
    """
    action = request.action.lower()
    
    if action == "reset_credits":
        if not request.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is required for reset_credits action."
            )
        user = crud.get_user_by_username(db, username=request.username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        
        user.credits = request.credits
        db.commit()
        db.refresh(user)
        return {
            "message": f"Successfully refilled credits to {request.credits} for user {request.username}.",
            "credits": user.credits,
            "subscription": user.subscription
        }
        
    elif action == "get_stats":
        total_users = db.query(models.User).count()
        total_predictions = db.query(models.PredictionLog).count()
        pro_users = db.query(models.User).filter(models.User.subscription == "pro").count()
        
        return {
            "total_users": total_users,
            "pro_users": pro_users,
            "total_predictions": total_predictions
        }
        
    elif action == "retrain_model":
        # Run retraining pipeline in a thread or simple block
        try:
            metrics = train_and_evaluate_models()
            return {
                "message": "Model retraining executed successfully via n8n.",
                "metrics": metrics
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Model retraining failed: {str(e)}"
            )
            
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported n8n action: '{request.action}'."
        )
