import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..utils.live_scraper import live_simulator
from ..ml.ensemble import predictor

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/live-simulation")
async def websocket_live_simulation(websocket: WebSocket):
    """
    WebSocket endpoint that simulates a live IPL run chase ball-by-ball, 
    calculates real-time win probability, and streams it to the client.
    """
    await websocket.accept()
    logger.info("WebSocket connection established.")
    
    try:
        # 1. Receive configuration message from client
        config = await websocket.receive_json()
        
        # Verify user authorization and credit level
        token = config.get("token")
        if token:
            from ..database.connection import SessionLocal
            from ..database import crud
            from ..core import security
            
            db = SessionLocal()
            try:
                username = security.decode_access_token(token)
                if username:
                    user = crud.get_user_by_username(db, username=username)
                    if user:
                        if user.subscription == "free" and user.credits <= 0:
                            await websocket.send_json({"error": "Out of credits. Please upgrade to Pro to run simulations."})
                            await websocket.close()
                            return
                        # Deduct 1 credit for starting a simulation session
                        crud.deduct_user_credit(db, user_id=user.id)
                else:
                    await websocket.send_json({"error": "Invalid authentication token."})
                    await websocket.close()
                    return
            finally:
                db.close()
        else:
            await websocket.send_json({"error": "Authentication token required."})
            await websocket.close()
            return

        mode = config.get("mode", "generative")
        delay = float(config.get("delay", 1.0))

        
        # 2. Select simulation stream source
        if mode == "historical":
            match_id = config.get("match_id")
            if not match_id:
                await websocket.send_json({"error": "Missing match_id for historical mode."})
                await websocket.close()
                return
            logger.info(f"Starting historical simulation for match ID {match_id} with delay {delay}s")
            generator = live_simulator.stream_historical_chase(match_id=str(match_id), delay_seconds=delay)
        else:
            batting_team = config.get("batting_team", "Royal Challengers Bengaluru")
            bowling_team = config.get("bowling_team", "Mumbai Indians")
            venue = config.get("venue", "M Chinnaswamy Stadium")
            target = int(config.get("target_runs", 180))
            logger.info(f"Starting generative simulation for {batting_team} vs {bowling_team} chasing {target} at {venue} with delay {delay}s")
            generator = live_simulator.stream_generative_chase(
                batting_team=batting_team,
                bowling_team=bowling_team,
                venue=venue,
                target_runs=target,
                delay_seconds=delay
            )
            
        # 3. Stream ball-by-ball states and run live prediction
        async for state in generator:
            # Calculate win probabilities on current ball state
            prob_bat, prob_bowl, crr, rrr, model_name = predictor.predict_live_chase(
                batting_team=state["batting_team"],
                bowling_team=state["bowling_team"],
                venue=config.get("venue", "M Chinnaswamy Stadium") if mode == "generative" else state.get("venue", "Wankhede Stadium"),
                target_runs=state["target_runs"],
                current_runs=state["current_runs"],
                wickets_lost=10 - state["wickets_left"],
                balls_bowled=state["balls_bowled"]
            )
            
            # Combine state and prediction
            payload = {
                **state,
                "batting_prob": round(prob_bat, 3),
                "bowling_prob": round(prob_bowl, 3),
                "model_used": model_name
            }
            
            # Pushes payload to client
            await websocket.send_json(payload)
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed by client.")
    except Exception as e:
        logger.error(f"WebSocket execution error: {e}")
        try:
            await websocket.send_json({"error": f"Internal server error: {str(e)}"})
        except Exception:
            pass
