from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ...database import connection, crud
from ...schemas import predict as predict_schemas
from ...core.config import settings
from ...ml.ensemble import predictor
from ...ml.explain import generate_pre_match_explanation
from .auth import get_current_user

router = APIRouter()

@router.post("/pre-match", response_model=predict_schemas.PreMatchResponse)
def predict_pre_match(
    request: predict_schemas.PreMatchRequest,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Predicts the winner of a match before it begins using the ensemble model.
    Generates a SHAP-style explanation and logs the prediction to the database.
    """
    # 1. Check credits
    if current_user.subscription == "free" and current_user.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Out of credits. Please upgrade to Pro to run predictions."
        )

    # 2. Run ensemble model
    team1_prob, team2_prob, model_name = predictor.predict_pre_match(
        team1=request.team1,
        team2=request.team2,
        venue=request.venue,
        toss_winner=request.toss_winner,
        toss_decision=request.toss_decision,
        head_to_head_win_rate=0.52,  # Baseline assumptions
        team1_venue_win_rate=0.55,
        team2_venue_win_rate=0.48,
        team1_form=0.60,
        team2_form=0.40
    )
    
    predicted_winner = request.team1 if team1_prob >= team2_prob else request.team2
    prob = team1_prob if predicted_winner == request.team1 else team2_prob

    # 3. Generate Explainable AI features (SHAP-style)
    explanation = generate_pre_match_explanation(
        team1=request.team1,
        team2=request.team2,
        venue=request.venue,
        toss_winner=request.toss_winner,
        toss_decision=request.toss_decision,
        head_to_head_win_rate=0.52,
        team1_venue_win_rate=0.55,
        team2_venue_win_rate=0.48,
        team1_form=0.60,
        team2_form=0.40,
        predicted_winner=predicted_winner,
        team1_probability=team1_prob
    )

    # 4. Log the prediction to the database
    crud.create_prediction_log(
        db=db,
        user_id=current_user.id,
        team1=request.team1,
        team2=request.team2,
        venue=request.venue,
        toss_winner=request.toss_winner,
        toss_decision=request.toss_decision,
        predicted_winner=predicted_winner,
        win_probability=prob,
        model_used=model_name,
        explanation_summary=explanation["summary"]
    )

    # 5. Deduct 1 credit
    crud.deduct_user_credit(db, user_id=current_user.id)

    return {
        "team1_probability": team1_prob,
        "team2_probability": team2_prob,
        "predicted_winner": predicted_winner,
        "model_used": model_name,
        "explanation": explanation
    }

@router.post("/live", response_model=predict_schemas.LiveChaseResponse)
@router.post("/live-chase", response_model=predict_schemas.LiveChaseResponse)
def predict_live(
    request: predict_schemas.LiveChaseRequest,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Predicts the live winning probability of the chasing team (batting team)
    during the second innings of an IPL match.
    """
    # 1. Check credits
    if current_user.subscription == "free" and current_user.credits <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Out of credits. Please upgrade to Pro to run live predictions."
        )

    prob_bat, prob_bowl, crr, rrr, model_name = predictor.predict_live_chase(
        batting_team=request.batting_team,
        bowling_team=request.bowling_team,
        venue=request.venue,
        target_runs=request.target_runs,
        current_runs=request.current_runs,
        wickets_lost=request.wickets_lost,
        balls_bowled=request.balls_bowled
    )

    # 2. Deduct 1 credit
    crud.deduct_user_credit(db, user_id=current_user.id)

    return {
        "batting_team_probability": prob_bat,
        "bowling_team_probability": prob_bowl,
        "crr": round(crr, 2),
        "rrr": round(rrr, 2),
        "model_used": model_name
    }


@router.get("/history", response_model=List[dict])
def get_prediction_history(
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Retrieves the prediction log history for the currently logged-in user.
    """
    logs = crud.get_predictions_by_user(db, user_id=current_user.id)
    return [
        {
            "id": log.id,
            "team1": log.team1,
            "team2": log.team2,
            "venue": log.venue,
            "toss_winner": log.toss_winner,
            "toss_decision": log.toss_decision,
            "predicted_winner": log.predicted_winner,
            "win_probability": log.win_probability,
            "model_used": log.model_used,
            "explanation_summary": log.explanation_summary,
            "created_at": log.created_at
        } for log in logs
    ]
