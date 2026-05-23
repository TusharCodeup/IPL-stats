import os
import pandas as pd
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "backend" / "app" / "datasets"

def perform_eda():
    matches_path = DATA_DIR / "matches_raw.csv"
    deliveries_path = DATA_DIR / "deliveries_raw.csv"
    
    if not matches_path.exists():
        logger.error(f"Data not found. Run pipeline downloader first. Looked in {matches_path}")
        return

    logger.info("Loading datasets for EDA...")
    df_matches = pd.read_csv(matches_path)
    
    # 1. Basic Stats
    logger.info(f"Total Matches: {len(df_matches)}")
    logger.info(f"Seasons: {df_matches['season'].dropna().unique().tolist()}")
    
    # Standardize winners
    df_clean = df_matches.dropna(subset=['winner']).copy()
    df_clean = df_clean[df_clean['winner'] != "Unknown"]
    df_clean = df_clean[df_clean['outcome'].isna()]  # exclude ties/no-results
    
    # 2. Toss Correlation Analysis
    toss_winners_won_match = len(df_clean[df_clean['winner'] == df_clean['toss_winner']])
    toss_win_pct = (toss_winners_won_match / len(df_clean)) * 100
    logger.info(f"Toss Winner won the match in {toss_win_pct:.2f}% of games.")
    
    # 3. Chasing vs Batting First Analysis
    # Let's see how many times chasing won
    chasing_wins = 0
    batting_first_wins = 0
    
    for _, r in df_clean.iterrows():
        t1, t2 = r['team1'], r['team2']
        toss_w = r['toss_winner']
        toss_d = r['toss_decision']
        winner = r['winner']
        
        # Chasing team
        if toss_d == 'field':
            chasing_team = toss_w
        else:
            chasing_team = t2 if toss_w == t1 else t1
            
        if winner == chasing_team:
            chasing_wins += 1
        else:
            batting_first_wins += 1
            
    chase_win_pct = (chasing_wins / len(df_clean)) * 100
    logger.info(f"Chasing team won: {chasing_wins} ({chase_win_pct:.2f}%) matches.")
    logger.info(f"Defending team won: {batting_first_wins} ({100 - chase_win_pct:.2f}%) matches.")

    # 4. Venue Chasing Advantage
    logger.info("Computing chasing advantage by venue...")
    venues = df_clean['venue'].dropna().unique()
    venue_data = []
    
    for venue in venues:
        v_matches = df_clean[df_clean['venue'] == venue]
        played = len(v_matches)
        if played < 10:  # Skip low sample venues
            continue
            
        c_wins = 0
        for _, r in v_matches.iterrows():
            t1, t2 = r['team1'], r['team2']
            toss_w = r['toss_winner']
            toss_d = r['toss_decision']
            winner = r['winner']
            
            if toss_d == 'field':
                chasing_team = toss_w
            else:
                chasing_team = t2 if toss_w == t1 else t1
                
            if winner == chasing_team:
                c_wins += 1
                
        c_pct = (c_wins / played) * 100
        venue_data.append({"venue": venue, "played": played, "chasing_win_pct": round(c_pct, 1)})
        
    venue_df = pd.DataFrame(venue_data).sort_values('played', ascending=False)
    logger.info("Top Venues Chasing win %:")
    logger.info("\n" + venue_df.head(10).to_string(index=False))

if __name__ == "__main__":
    perform_eda()
