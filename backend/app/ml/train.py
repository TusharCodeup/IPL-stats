import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import mlflow
import mlflow.sklearn
from ..core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Constants
DATASET_DIR = settings.DATASET_DIR
MODELS_DIR = settings.MODELS_DIR

# Normalized names mappings
TEAM_MAPPING = {
    "Delhi Daredevils": "Delhi Capitals",
    "Kings XI Punjab": "Punjab Kings",
    "Deccan Chargers": "Sunrisers Hyderabad",
    "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
    "Rising Pune Supergiants": "Rising Pune Supergiant",
    "Pune Warriors": "Pune Warriors",
    "Gujarat Lions": "Gujarat Lions",
    "Kochi Tuskers Kerala": "Kochi Tuskers Kerala"
}

def normalize_team(name):
    if not isinstance(name, str):
        return "Unknown"
    return TEAM_MAPPING.get(name, name)

def normalize_venue(venue):
    if not isinstance(venue, str):
        return "Unknown"
    v = venue.lower().strip()
    if "chinnaswamy" in v:
        return "M Chinnaswamy Stadium"
    elif "wankhede" in v:
        return "Wankhede Stadium"
    elif "eden gardens" in v:
        return "Eden Gardens"
    elif "chidambaram" in v or "chepauk" in v:
        return "MA Chidambaram Stadium"
    elif "kotla" in v or "jaitley" in v:
        return "Arjun Jaitley Stadium"
    elif "pca" in v or "mohali" in v or "bindra" in v or "punjab cricket association" in v:
        return "PCA Stadium Mohali"
    elif "rajiv gandhi" in v or "uppal" in v:
        return "Rajiv Gandhi International Stadium"
    elif "dy patil" in v:
        return "DY Patil Stadium"
    elif "brabourne" in v:
        return "Brabourne Stadium"
    elif "sawai mansingh" in v:
        return "Sawai Mansingh Stadium"
    elif "mca" in v or "subrata" in v or "pune" in v:
        return "MCA Stadium Pune"
    elif "barsapara" in v or "guwahati" in v:
        return "Barsapara Cricket Stadium"
    elif "dharamsala" in v or "himachal pradesh" in v:
        return "HPCA Stadium Dharamsala"
    elif "narendra modi" in v or "motera" in v:
        return "Narendra Modi Stadium"
    elif "ekana" in v or "atal bihari" in v or "lucknow" in v:
        return "Ekana Cricket Stadium"
    return venue.title()

def compute_pre_match_features(df):
    """
    Computes rolling features for pre-match predictions to prevent data leakage.
    Features: head_to_head_win_rate, venue_win_rates, recent_form.
    """
    logger.info("Computing rolling features for matches...")
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    
    head_to_head = []
    team1_venue_wr = []
    team2_venue_wr = []
    team1_form = []
    team2_form = []
    
    for idx, row in df.iterrows():
        t1, t2 = row['team1'], row['team2']
        venue = row['venue']
        current_date = row['date']
        
        # Matches played strictly before the current match date
        past_matches = df[df['date'] < current_date]
        
        # 1. Head-to-Head win rate of team1 vs team2
        h2h_matches = past_matches[
            ((past_matches['team1'] == t1) & (past_matches['team2'] == t2)) |
            ((past_matches['team1'] == t2) & (past_matches['team2'] == t1))
        ]
        if len(h2h_matches) > 0:
            t1_wins = len(h2h_matches[h2h_matches['winner'] == t1])
            h2h_wr = t1_wins / len(h2h_matches)
        else:
            h2h_wr = 0.5
        head_to_head.append(h2h_wr)
        
        # 2. Venue win rate for Team 1
        t1_venue = past_matches[
            (past_matches['venue'] == venue) & 
            ((past_matches['team1'] == t1) | (past_matches['team2'] == t1))
        ]
        if len(t1_venue) > 0:
            t1_wins = len(t1_venue[t1_venue['winner'] == t1])
            t1_v_wr = t1_wins / len(t1_venue)
        else:
            t1_v_wr = 0.5
        team1_venue_wr.append(t1_v_wr)
        
        # 3. Venue win rate for Team 2
        t2_venue = past_matches[
            (past_matches['venue'] == venue) & 
            ((past_matches['team1'] == t2) | (past_matches['team2'] == t2))
        ]
        if len(t2_venue) > 0:
            t2_wins = len(t2_venue[t2_venue['winner'] == t2])
            t2_v_wr = t2_wins / len(t2_venue)
        else:
            t2_v_wr = 0.5
        team2_venue_wr.append(t2_v_wr)
        
        # 4. Form (win rate in last 5 matches) for Team 1
        t1_past = past_matches[
            (past_matches['team1'] == t1) | (past_matches['team2'] == t1)
        ].tail(5)
        if len(t1_past) > 0:
            t1_wins = len(t1_past[t1_past['winner'] == t1])
            t1_f = t1_wins / len(t1_past)
        else:
            t1_f = 0.5
        team1_form.append(t1_f)
        
        # 5. Form (win rate in last 5 matches) for Team 2
        t2_past = past_matches[
            (past_matches['team1'] == t2) | (past_matches['team2'] == t2)
        ].tail(5)
        if len(t2_past) > 0:
            t2_wins = len(t2_past[t2_past['winner'] == t2])
            t2_f = t2_wins / len(t2_past)
        else:
            t2_f = 0.5
        team2_form.append(t2_f)
        
    df['head_to_head_win_rate'] = head_to_head
    df['team1_venue_win_rate'] = team1_venue_wr
    df['team2_venue_win_rate'] = team2_venue_wr
    df['team1_form'] = team1_form
    df['team2_form'] = team2_form
    return df

def build_live_chase_dataset(df_matches, df_deliveries):
    """
    Reconstructs ball-by-ball run chases (innings 2) to build training samples.
    Features: batting_team, bowling_team, venue, target, runs_needed, balls_left, wickets_left, crr, rrr.
    """
    logger.info("Building live chase dataset (2nd innings ball-by-ball)...")
    
    # Map match outputs
    match_winners = df_matches.set_index('match_id')['winner'].to_dict()
    match_venues = df_matches.set_index('match_id')['venue'].to_dict()
    
    # We filter only standard 20-over matches
    df_del = df_deliveries.copy()
    df_del['match_winner'] = df_del['match_id'].map(match_winners)
    df_del['venue'] = df_del['match_id'].map(match_venues)
    
    # Clean and fill missing
    df_del['runs_off_bat'] = pd.to_numeric(df_del['runs_off_bat'], errors='coerce').fillna(0)
    df_del['extras'] = pd.to_numeric(df_del['extras'], errors='coerce').fillna(0)
    df_del['total_runs'] = df_del['runs_off_bat'] + df_del['extras']
    df_del['is_wicket'] = df_del['player_dismissed'].notna().astype(int)
    
    # Separate 1st and 2nd innings
    # Innings 1 score
    inn1_scores = df_del[df_del['innings'] == 1].groupby('match_id')['total_runs'].sum().to_dict()
    
    # We only care about matches that have an Innings 1 score and an Innings 2 played
    chase_records = []
    
    # Group by match
    grouped = df_del.groupby('match_id')
    for match_id, group in grouped:
        if match_id not in inn1_scores:
            continue
        
        target = inn1_scores[match_id] + 1
        inn2 = group[group['innings'] == 2].sort_values(['ball']).copy()
        if len(inn2) == 0:
            continue
            
        winner = match_winners.get(match_id)
        if pd.isna(winner) or winner == "Unknown":
            continue
            
        batting_team = inn2['batting_team'].iloc[0]
        bowling_team = inn2['bowling_team'].iloc[0]
        venue = inn2['venue'].iloc[0]
        
        chase_success = 1 if winner == batting_team else 0
        
        # Calculate running scores
        current_runs = 0
        wickets_lost = 0
        balls_bowled = 0
        
        for idx, row in inn2.iterrows():
            # Parse ball number to get total legal/played balls
            ball_float = float(row['ball'])
            over = int(ball_float)
            ball_num = int(round((ball_float - over) * 10))
            # Limit to standard overs
            if over >= 20:
                continue
                
            balls_bowled = over * 6 + min(ball_num, 6)
            
            # Wides/no-balls don't consume balls in modern terms, but ball increments (0.1, 0.2) in Cricsheet
            # usually represent legal balls unless noted. Let's use simple balls_bowled = over * 6 + ball_num
            # capped at 120.
            balls_left = max(120 - balls_bowled, 0)
            
            # Running parameters
            current_runs += row['total_runs']
            wickets_lost += row['is_wicket']
            
            runs_needed = max(target - current_runs, 0)
            wickets_left = max(10 - wickets_lost, 0)
            
            # Run rates
            crr = (current_runs / balls_bowled) * 6 if balls_bowled > 0 else 0.0
            rrr = (runs_needed / (balls_left / 6.0)) if balls_left > 0 else (36.0 if runs_needed > 0 else 0.0)
            
            chase_records.append({
                "match_id": match_id,
                "batting_team": batting_team,
                "bowling_team": bowling_team,
                "venue": venue,
                "target_runs": target,
                "current_runs": current_runs,
                "runs_needed": runs_needed,
                "balls_left": balls_left,
                "wickets_left": wickets_left,
                "crr": crr,
                "rrr": rrr,
                "chase_success": chase_success
            })
            
            # End of innings
            if wickets_left == 0 or runs_needed == 0:
                break
                
    return pd.DataFrame(chase_records)

def train_and_evaluate_models():
    """Trains Pre-match and Live Chase models using an ensemble approach."""
    # Ensure directories exist
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Set up MLflow tracking
    mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
    mlflow.set_experiment("IPL Match Winner Prediction System")
    
    # 1. Load data
    matches_csv = DATASET_DIR / "matches_raw.csv"
    deliveries_csv = DATASET_DIR / "deliveries_raw.csv"
    
    if not matches_csv.exists() or not deliveries_csv.exists():
        logger.error("Raw CSVs not found. Please run the data pipeline first.")
        raise FileNotFoundError("Missing raw data files.")
        
    df_matches = pd.read_csv(matches_csv)
    df_deliveries = pd.read_csv(deliveries_csv)
    
    # Preprocess match names
    df_matches['team1'] = df_matches['team1'].apply(normalize_team)
    df_matches['team2'] = df_matches['team2'].apply(normalize_team)
    df_matches['toss_winner'] = df_matches['toss_winner'].apply(normalize_team)
    df_matches['winner'] = df_matches['winner'].apply(normalize_team)
    df_matches['venue'] = df_matches['venue'].apply(normalize_venue)
    
    df_deliveries['batting_team'] = df_deliveries['batting_team'].apply(normalize_team)
    df_deliveries['bowling_team'] = df_deliveries['bowling_team'].apply(normalize_team)
    
    # Drop rows without clear winners (no results/abandoned)
    df_matches = df_matches.dropna(subset=['winner'])
    df_matches = df_matches[df_matches['winner'] != "Unknown"]
    df_matches = df_matches[df_matches['outcome'].isna()] # No ties/no-results in training
    
    # 2. Build Category Encoder mappings
    # Find all unique teams and venues
    all_teams = sorted(list(set(df_matches['team1'].tolist() + df_matches['team2'].tolist())))
    all_venues = sorted(list(df_matches['venue'].unique()))
    
    # Create index mappings (0-based) for label encoding
    team_to_idx = {team: idx for idx, team in enumerate(all_teams)}
    venue_to_idx = {venue: idx for idx, venue in enumerate(all_venues)}
    
    # Add default "Other" key to handle unknown venues/teams gracefully
    team_to_idx["Other"] = len(all_teams)
    venue_to_idx["Other"] = len(all_venues)
    
    # Save categorical mappings to models folder
    encoder_mapping = {
        "teams": team_to_idx,
        "venues": venue_to_idx
    }
    joblib.dump(encoder_mapping, MODELS_DIR / "encoder.pkl")
    with open(MODELS_DIR / "encoder.json", "w", encoding='utf-8') as f:
        json.dump(encoder_mapping, f, indent=2)
    logger.info("Category mappings saved.")
    
    # Helper to encode columns
    def encode_col(val, mapping):
        return mapping.get(val, mapping["Other"])

    # Compute rolling features
    df_matches = compute_pre_match_features(df_matches)
    
    # 3. Train Pre-Match Predictor
    logger.info("Training Pre-Match Predictor Models...")
    
    # target: team1_win (1 if team1 wins, 0 if team2 wins)
    df_matches['team1_win'] = (df_matches['winner'] == df_matches['team1']).astype(int)
    
    # Encode categorical columns
    df_matches['team1_enc'] = df_matches['team1'].apply(lambda x: encode_col(x, team_to_idx))
    df_matches['team2_enc'] = df_matches['team2'].apply(lambda x: encode_col(x, team_to_idx))
    df_matches['venue_enc'] = df_matches['venue'].apply(lambda x: encode_col(x, venue_to_idx))
    df_matches['toss_winner_enc'] = df_matches['toss_winner'].apply(lambda x: encode_col(x, team_to_idx))
    df_matches['toss_decision_enc'] = (df_matches['toss_decision'] == 'field').astype(int)
    
    pre_match_features = [
        'team1_enc', 'team2_enc', 'venue_enc', 
        'toss_winner_enc', 'toss_decision_enc',
        'head_to_head_win_rate', 'team1_venue_win_rate', 'team2_venue_win_rate',
        'team1_form', 'team2_form'
    ]
    
    X_pre = df_matches[pre_match_features]
    y_pre = df_matches['team1_win']
    
    X_train_pre, X_test_pre, y_train_pre, y_test_pre = train_test_split(
        X_pre, y_pre, test_size=0.2, random_state=42, stratify=y_pre
    )
    
    with mlflow.start_run(run_name="Pre_Match_Ensemble"):
        logger.info("Fitting Pre-Match Logistic Regression...")
        lr_pre = LogisticRegression(max_iter=1000)
        lr_pre.fit(X_train_pre, y_train_pre)
        
        logger.info("Fitting Pre-Match Random Forest...")
        rf_pre = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42)
        rf_pre.fit(X_train_pre, y_train_pre)
        
        logger.info("Fitting Pre-Match XGBoost...")
        xgb_pre = XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05, random_state=42)
        xgb_pre.fit(X_train_pre, y_train_pre)
        
        # Evaluate XGBoost
        preds_xgb = xgb_pre.predict(X_test_pre)
        probs_xgb = xgb_pre.predict_proba(X_test_pre)[:, 1]
        
        acc = accuracy_score(y_test_pre, preds_xgb)
        roc_auc = roc_auc_score(y_test_pre, probs_xgb)
        
        mlflow.log_params({"model_type": "XGBoost", "n_estimators": 100, "max_depth": 4})
        mlflow.log_metrics({"accuracy": acc, "roc_auc": roc_auc})
        
        # Persist pre-match models
        pre_match_models = {
            "lr": lr_pre,
            "rf": rf_pre,
            "xgb": xgb_pre,
            "features": pre_match_features
        }
        joblib.dump(pre_match_models, MODELS_DIR / "pre_match_model.pkl")
        mlflow.sklearn.log_model(xgb_pre, "pre_match_xgb")
        logger.info(f"Pre-match models saved. XGBoost Accuracy: {acc:.4f}, ROC-AUC: {roc_auc:.4f}")
        
    # 4. Train Live Chase Predictor
    logger.info("Training Live Chase Predictor Models...")
    
    df_chase = build_live_chase_dataset(df_matches, df_deliveries)
    
    df_chase['batting_team_enc'] = df_chase['batting_team'].apply(lambda x: encode_col(x, team_to_idx))
    df_chase['bowling_team_enc'] = df_chase['bowling_team'].apply(lambda x: encode_col(x, team_to_idx))
    df_chase['venue_enc'] = df_chase['venue'].apply(lambda x: encode_col(x, venue_to_idx))
    
    live_features = [
        'batting_team_enc', 'bowling_team_enc', 'venue_enc',
        'target_runs', 'runs_needed', 'balls_left', 'wickets_left', 'crr', 'rrr'
    ]
    
    X_live = df_chase[live_features]
    y_live = df_chase['chase_success']
    
    X_train_live, X_test_live, y_train_live, y_test_live = train_test_split(
        X_live, y_live, test_size=0.2, random_state=42, stratify=y_live
    )
    
    with mlflow.start_run(run_name="Live_Chase_Ensemble"):
        logger.info("Fitting Live Logistic Regression...")
        lr_live = LogisticRegression(max_iter=1000)
        lr_live.fit(X_train_live, y_train_live)
        
        logger.info("Fitting Live Random Forest...")
        rf_live = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        rf_live.fit(X_train_live, y_train_live)
        
        logger.info("Fitting Live XGBoost...")
        xgb_live = XGBClassifier(n_estimators=150, max_depth=6, learning_rate=0.08, random_state=42)
        xgb_live.fit(X_train_live, y_train_live)
        
        # Evaluate XGBoost
        preds_live = xgb_live.predict(X_test_live)
        probs_live = xgb_live.predict_proba(X_test_live)[:, 1]
        
        acc_live = accuracy_score(y_test_live, preds_live)
        roc_auc_live = roc_auc_score(y_test_live, probs_live)
        
        mlflow.log_params({"model_type": "XGBoost_Live", "n_estimators": 150, "max_depth": 6})
        mlflow.log_metrics({"accuracy": acc_live, "roc_auc": roc_auc_live})
        
        # Persist live models
        live_models = {
            "lr": lr_live,
            "rf": rf_live,
            "xgb": xgb_live,
            "features": live_features
        }
        joblib.dump(live_models, MODELS_DIR / "live_chase_model.pkl")
        mlflow.sklearn.log_model(xgb_live, "live_xgb")
        logger.info(f"Live models saved. XGBoost Accuracy: {acc_live:.4f}, ROC-AUC: {roc_auc_live:.4f}")

    # 5. Save model metadata
    metadata = {
        "model_ensemble_version": "1.0.0",
        "trained_on": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "dataset_version": "Cricsheet IPL CSV2",
        "roc_auc_pre_match": float(roc_auc),
        "roc_auc_live_chase": float(roc_auc_live),
        "accuracy_pre_match": float(acc),
        "accuracy_live_chase": float(acc_live),
        "features_pre_match": pre_match_features,
        "features_live_chase": live_features
    }
    with open(MODELS_DIR / "metadata.json", "w", encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    logger.info("Metadata JSON written.")

if __name__ == "__main__":
    train_and_evaluate_models()
