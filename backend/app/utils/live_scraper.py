import random
import asyncio
import pandas as pd
from pathlib import Path
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

DATASET_DIR = settings.DATASET_DIR

class LiveMatchSimulator:
    def __init__(self):
        self.deliveries_df = None
        self.load_deliveries()

    def load_deliveries(self):
        """Loads raw deliveries data to fetch actual ball-by-ball records."""
        try:
            filepath = DATASET_DIR / "deliveries_raw.csv"
            if filepath.exists():
                # Read only needed columns to save memory
                cols = ['match_id', 'innings', 'ball', 'batting_team', 'bowling_team', 
                        'runs_off_bat', 'extras', 'player_dismissed']
                self.deliveries_df = pd.read_csv(filepath, usecols=cols)
                logger.info("Deliveries loaded in LiveMatchSimulator.")
        except Exception as e:
            logger.error(f"Error loading deliveries in simulator: {e}")

    def get_match_deliveries(self, match_id: str):
        """Returns second innings deliveries for a given match ID."""
        if self.deliveries_df is None:
            return None
        
        # Filter deliveries for match_id and innings 2
        df_match = self.deliveries_df[
            (self.deliveries_df['match_id'].astype(str) == str(match_id)) & 
            (self.deliveries_df['innings'] == 2)
        ].sort_values('ball').copy()
        
        return df_match

    async def stream_historical_chase(self, match_id: str, delay_seconds: float = 1.0):
        """
        Asynchronous generator that streams actual deliveries of a historical chase ball-by-ball.
        Yields current score, wickets, balls bowled, target, crr, rrr.
        """
        df_match = self.get_match_deliveries(match_id)
        if df_match is None or len(df_match) == 0:
            logger.warning(f"No innings 2 deliveries found for match {match_id}. Falling back to generative.")
            async for state in self.stream_generative_chase(
                batting_team="Royal Challengers Bengaluru",
                bowling_team="Mumbai Indians",
                venue="Wankhede Stadium",
                target_runs=180,
                delay_seconds=delay_seconds
            ):
                yield state
            return

        # Fetch first innings score to calculate target
        # For simplicity, we assume we sum deliveries of innings 1, or we calculate it from innings 2 target.
        # But we can also look at the first row of innings 2. Let's calculate from deliveries total.
        df_inn1 = self.deliveries_df[
            (self.deliveries_df['match_id'].astype(str) == str(match_id)) & 
            (self.deliveries_df['innings'] == 1)
        ]
        inn1_total = int(df_inn1['runs_off_bat'].sum() + df_inn1['extras'].sum())
        target = inn1_total + 1
        if target <= 1:
            target = 160  # Default fallback target if 1st innings data missing
            
        batting_team = df_match['batting_team'].iloc[0]
        bowling_team = df_match['bowling_team'].iloc[0]
        
        current_runs = 0
        wickets_lost = 0
        balls_bowled = 0
        
        for idx, row in df_match.iterrows():
            ball_float = float(row['ball'])
            over = int(ball_float)
            ball_num = int(round((ball_float - over) * 10))
            if over >= 20:
                continue
                
            balls_bowled = over * 6 + min(ball_num, 6)
            
            # Update score
            runs_off_bat = int(row['runs_off_bat']) if not pd.isna(row['runs_off_bat']) else 0
            extras = int(row['extras']) if not pd.isna(row['extras']) else 0
            current_runs += (runs_off_bat + extras)
            
            if not pd.isna(row['player_dismissed']):
                wickets_lost += 1
                
            runs_needed = max(target - current_runs, 0)
            wickets_left = max(10 - wickets_lost, 0)
            balls_left = max(120 - balls_bowled, 0)
            
            crr = (current_runs / balls_bowled) * 6 if balls_bowled > 0 else 0.0
            rrr = (runs_needed / (balls_left / 6.0)) if balls_left > 0 else (36.0 if runs_needed > 0 else 0.0)
            
            state = {
                "batting_team": batting_team,
                "bowling_team": bowling_team,
                "target_runs": target,
                "current_runs": current_runs,
                "runs_needed": runs_needed,
                "balls_left": balls_left,
                "wickets_left": wickets_left,
                "crr": round(crr, 2),
                "rrr": round(rrr, 2),
                "balls_bowled": balls_bowled,
                "last_ball_event": f"Runs: {runs_off_bat + extras}" + (" (Wicket!)" if not pd.isna(row['player_dismissed']) else "")
            }
            
            yield state
            await asyncio.sleep(delay_seconds)
            
            if wickets_left <= 0 or runs_needed <= 0 or balls_left <= 0:
                break

    async def stream_generative_chase(self, batting_team: str, bowling_team: str, venue: str, 
                                     target_runs: int, delay_seconds: float = 1.0):
        """
        Asynchronous generator that simulates a run chase dynamically ball-by-ball.
        """
        current_runs = 0
        wickets_lost = 0
        balls_bowled = 0
        
        # Probabilities of outcomes in a typical T20 delivery
        outcomes = [0, 1, 2, 4, 6, 'wicket', 'wide']
        weights = [0.35, 0.40, 0.08, 0.09, 0.04, 0.03, 0.01]  # roughly typical
        
        while balls_bowled < 120 and wickets_lost < 10 and current_runs < target_runs:
            outcome = random.choices(outcomes, weights=weights)[0]
            
            event_text = ""
            if outcome == 'wicket':
                wickets_lost += 1
                balls_bowled += 1
                event_text = "Wicket!"
            elif outcome == 'wide':
                current_runs += 1
                event_text = "Wide (1 run)"
            else:
                current_runs += outcome
                balls_bowled += 1
                event_text = f"{outcome} run(s)"
                
            runs_needed = max(target_runs - current_runs, 0)
            wickets_left = max(10 - wickets_lost, 0)
            balls_left = max(120 - balls_bowled, 0)
            
            crr = (current_runs / balls_bowled) * 6 if balls_bowled > 0 else 0.0
            rrr = (runs_needed / (balls_left / 6.0)) if balls_left > 0 else (36.0 if runs_needed > 0 else 0.0)
            
            state = {
                "batting_team": batting_team,
                "bowling_team": bowling_team,
                "target_runs": target_runs,
                "current_runs": current_runs,
                "runs_needed": runs_needed,
                "balls_left": balls_left,
                "wickets_left": wickets_left,
                "crr": round(crr, 2),
                "rrr": round(rrr, 2),
                "balls_bowled": balls_bowled,
                "last_ball_event": event_text
            }
            
            yield state
            await asyncio.sleep(delay_seconds)

# Singleton instance
live_simulator = LiveMatchSimulator()
