import joblib
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from ..core.config import settings

logger = logging.getLogger(__name__)

MODELS_DIR = settings.MODELS_DIR

class EnsemblePredictor:
    def __init__(self):
        self.encoder = None
        self.pre_match_models = None
        self.live_chase_models = None
        self.load_models()

    def load_models(self):
        """Loads models and mappings from the models directory."""
        try:
            encoder_path = MODELS_DIR / "encoder.pkl"
            pre_match_path = MODELS_DIR / "pre_match_model.pkl"
            live_chase_path = MODELS_DIR / "live_chase_model.pkl"

            if encoder_path.exists():
                self.encoder = joblib.load(encoder_path)
                logger.info("Category encoder loaded successfully.")
            else:
                logger.warning(f"Encoder file not found at {encoder_path}")

            if pre_match_path.exists():
                self.pre_match_models = joblib.load(pre_match_path)
                logger.info("Pre-match models loaded successfully.")
            else:
                logger.warning(f"Pre-match model file not found at {pre_match_path}")

            if live_chase_path.exists():
                self.live_chase_models = joblib.load(live_chase_path)
                logger.info("Live-chase models loaded successfully.")
            else:
                logger.warning(f"Live-chase model file not found at {live_chase_path}")

        except Exception as e:
            logger.error(f"Error loading models: {e}")

    def is_loaded(self):
        return (self.encoder is not None and 
                self.pre_match_models is not None and 
                self.live_chase_models is not None)

    def _encode_value(self, val, mapping_type):
        """Encodes a team or venue using the loaded dictionary maps with 'Other' fallback."""
        if not self.encoder or mapping_type not in self.encoder:
            return 0
        mapping = self.encoder[mapping_type]
        # Unknown venue/team handling: defaults to 'Other' if not in dictionary
        return mapping.get(val, mapping.get("Other", 0))

    def fallback_pre_match(self, team1, team2):
        """
        Simple statistical fallback if ML pre-match prediction fails.
        Defaults to a historical coin-flip/base-line assumption.
        """
        logger.info(f"Using fallback pre-match estimation for {team1} vs {team2}")
        # Default 50/50
        return 0.50, 0.50

    def predict_pre_match(self, team1, team2, venue, toss_winner, toss_decision, 
                           head_to_head_win_rate=0.5, team1_venue_win_rate=0.5, 
                           team2_venue_win_rate=0.5, team1_form=0.5, team2_form=0.5):
        """
        Ensemble prediction for pre-match win probability.
        Formula: 0.20 * LR + 0.30 * RF + 0.50 * XGB
        """
        if not self.is_loaded():
            logger.warning("Models not loaded. Using fallback prediction.")
            p1, p2 = self.fallback_pre_match(team1, team2)
            return p1, p2, "Fallback Estimator"

        try:
            # 1. Encode values
            t1_enc = self._encode_value(team1, "teams")
            t2_enc = self._encode_value(team2, "teams")
            v_enc = self._encode_value(venue, "venues")
            tw_enc = self._encode_value(toss_winner, "teams")
            td_enc = 1 if toss_decision.lower() == 'field' else 0

            # 2. Recreate input DataFrame
            features = self.pre_match_models["features"]
            data = pd.DataFrame([{
                'team1_enc': t1_enc,
                'team2_enc': t2_enc,
                'venue_enc': v_enc,
                'toss_winner_enc': tw_enc,
                'toss_decision_enc': td_enc,
                'head_to_head_win_rate': head_to_head_win_rate,
                'team1_venue_win_rate': team1_venue_win_rate,
                'team2_venue_win_rate': team2_venue_win_rate,
                'team1_form': team1_form,
                'team2_form': team2_form
            }])[features]

            # 3. Model Predictions
            lr = self.pre_match_models["lr"]
            rf = self.pre_match_models["rf"]
            xgb = self.pre_match_models["xgb"]

            prob_lr = lr.predict_proba(data)[0, 1]
            prob_rf = rf.predict_proba(data)[0, 1]
            prob_xgb = xgb.predict_proba(data)[0, 1]

            # 4. Blend probabilities (0.2 * LR + 0.3 * RF + 0.5 * XGB)
            p1_prob = 0.20 * prob_lr + 0.30 * prob_rf + 0.50 * prob_xgb
            p1_prob = float(np.clip(p1_prob, 0.01, 0.99))
            p2_prob = 1.0 - p1_prob

            return p1_prob, p2_prob, "Ensemble (LR + RF + XGBoost)"

        except Exception as e:
            logger.error(f"Error in pre-match ensemble prediction: {e}. Falling back...")
            p1, p2 = self.fallback_pre_match(team1, team2)
            return p1, p2, "Fallback Estimator (Error)"

    def predict_live_chase(self, batting_team, bowling_team, venue, target_runs, 
                           current_runs, wickets_lost, balls_bowled):
        """
        Ensemble prediction for live run chase.
        Formula: 0.20 * LR + 0.30 * RF + 0.50 * XGB
        """
        # Calculate dynamic metrics
        runs_needed = max(target_runs - current_runs, 0)
        balls_left = max(120 - balls_bowled, 0)
        wickets_left = max(10 - wickets_lost, 0)
        
        crr = (current_runs / balls_bowled) * 6 if balls_bowled > 0 else 0.0
        rrr = (runs_needed / (balls_left / 6.0)) if balls_left > 0 else (36.0 if runs_needed > 0 else 0.0)

        if not self.is_loaded():
            # Statistical fallback for live chase: ratio of CRR vs RRR, and wickets
            logger.warning("Models not loaded. Using fallback live prediction.")
            if runs_needed <= 0:
                return 1.0, 0.0, crr, rrr, "Fallback Estimator"
            if wickets_left <= 0 or (balls_left <= 0 and runs_needed > 0):
                return 0.0, 1.0, crr, rrr, "Fallback Estimator"
            
            # Simple heuristic
            ratio = crr / (rrr + 0.1)
            prob_bat = 0.5 * ratio * (wickets_left / 10.0)
            prob_bat = float(np.clip(prob_bat, 0.05, 0.95))
            return prob_bat, 1.0 - prob_bat, crr, rrr, "Fallback Estimator"

        try:
            # 1. Encode values
            bat_enc = self._encode_value(batting_team, "teams")
            bowl_enc = self._encode_value(bowling_team, "teams")
            v_enc = self._encode_value(venue, "venues")

            # 2. Recreate input DataFrame
            features = self.live_chase_models["features"]
            data = pd.DataFrame([{
                'batting_team_enc': bat_enc,
                'bowling_team_enc': bowl_enc,
                'venue_enc': v_enc,
                'target_runs': target_runs,
                'runs_needed': runs_needed,
                'balls_left': balls_left,
                'wickets_left': wickets_left,
                'crr': crr,
                'rrr': rrr
            }])[features]

            # 3. Model Predictions
            lr = self.live_chase_models["lr"]
            rf = self.live_chase_models["rf"]
            xgb = self.live_chase_models["xgb"]

            prob_lr = lr.predict_proba(data)[0, 1]
            prob_rf = rf.predict_proba(data)[0, 1]
            prob_xgb = xgb.predict_proba(data)[0, 1]

            # 4. Blend probabilities
            prob_bat = 0.20 * prob_lr + 0.30 * prob_rf + 0.50 * prob_xgb
            
            # Boundary checks
            if runs_needed <= 0:
                prob_bat = 1.0
            elif wickets_left <= 0 or (balls_left <= 0 and runs_needed > 0):
                prob_bat = 0.0
            else:
                prob_bat = float(np.clip(prob_bat, 0.01, 0.99))

            prob_bowl = 1.0 - prob_bat

            return prob_bat, prob_bowl, crr, rrr, "Ensemble (LR + RF + XGBoost)"

        except Exception as e:
            logger.error(f"Error in live ensemble prediction: {e}. Falling back...")
            # Heuristic fallback
            ratio = crr / (rrr + 0.1)
            prob_bat = 0.5 * ratio * (wickets_left / 10.0)
            prob_bat = float(np.clip(prob_bat, 0.05, 0.95))
            return prob_bat, 1.0 - prob_bat, crr, rrr, "Fallback Estimator (Error)"

# Singleton instance
predictor = EnsemblePredictor()
