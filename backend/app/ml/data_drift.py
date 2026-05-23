import logging
import pandas as pd
from ..core.config import settings

logger = logging.getLogger(__name__)

def check_data_drift():
    """
    Compares historical matches (pre-2022) with recent matches (2022+)
    to evaluate data drift on two key cricket indices:
    1. Home Win Rate
    2. Toss Win correlation to Match Win
    """
    filepath = settings.DATASET_DIR / "matches_raw.csv"
    if not filepath.exists():
        logger.warning(f"Matches CSV not found at {filepath}. Cannot compute drift.")
        return {"status": "error", "message": "Dataset not found."}
        
    try:
        df = pd.read_csv(filepath)
        if 'season' not in df.columns:
            return {"status": "error", "message": "Invalid dataset schema."}
            
        df['season_year'] = df['season'].str.extract(r'(\d{4})').astype(float)
        
        # Split into historical (reference) and recent (current)
        ref_df = df[df['season_year'] < 2022].dropna(subset=['winner']).copy()
        curr_df = df[df['season_year'] >= 2022].dropna(subset=['winner']).copy()
        
        if len(ref_df) == 0 or len(curr_df) == 0:
            return {
                "status": "insufficient_data",
                "message": "Need both historical (<2022) and modern (>=2022) matches to analyze drift."
            }
            
        # 1. Home Win Rate (team1 win rate)
        ref_home = len(ref_df[ref_df['winner'] == ref_df['team1']]) / len(ref_df)
        curr_home = len(curr_df[curr_df['winner'] == curr_df['team1']]) / len(curr_df)
        home_drift = abs(ref_home - curr_home)
        
        # 2. Toss Correlation
        ref_toss = len(ref_df[ref_df['winner'] == ref_df['toss_winner']]) / len(ref_df)
        curr_toss = len(curr_df[curr_df['winner'] == curr_df['toss_winner']]) / len(curr_df)
        toss_drift = abs(ref_toss - curr_toss)
        
        # Drift status flag (threshold of 8% shift)
        drift_detected = home_drift > 0.08 or toss_drift > 0.08
        
        return {
            "drift_detected": bool(drift_detected),
            "status": "warning" if drift_detected else "stable",
            "message": "Model inputs are within stable statistical parameters." if not drift_detected else "Drift Warning: Significant shifts in home advantage or toss win correlations detected.",
            "metrics": {
                "home_win_rate": {
                    "historical": round(ref_home, 3),
                    "current": round(curr_home, 3),
                    "drift_score": round(home_drift, 3)
                },
                "toss_win_correlation": {
                    "historical": round(ref_toss, 3),
                    "current": round(curr_toss, 3),
                    "drift_score": round(toss_drift, 3)
                }
            }
        }
    except Exception as e:
        logger.error(f"Error computing data drift: {e}")
        return {"status": "error", "message": f"Drift calculation failed: {str(e)}"}
