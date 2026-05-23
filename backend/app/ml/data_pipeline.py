import os
import urllib.request
import zipfile
import pandas as pd
from pathlib import Path
import logging
from ..core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Directory setup
DATASET_DIR = settings.DATASET_DIR
ZIP_PATH = DATASET_DIR / "ipl_male_csv2.zip"
EXTRACT_DIR = DATASET_DIR / "ipl_male_csv2"

def download_dataset():
    """Downloads the Cricsheet IPL CSV dataset if it doesn't exist."""
    if ZIP_PATH.exists():
        logger.info(f"Dataset zip already exists at {ZIP_PATH}. Skipping download.")
        return

    logger.info(f"Downloading IPL dataset from {settings.DATASET_URL}...")
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    
    # Download with custom User-Agent to avoid blocking
    req = urllib.request.Request(
        settings.DATASET_URL,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    with urllib.request.urlopen(req) as response, open(ZIP_PATH, 'wb') as out_file:
        data = response.read()
        out_file.write(data)
    logger.info("Download completed.")

def extract_dataset():
    """Extracts the dataset zip file."""
    logger.info(f"Extracting dataset to {EXTRACT_DIR}...")
    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
        zip_ref.extractall(EXTRACT_DIR)
    logger.info("Extraction completed.")

def parse_info_file(filepath):
    """
    Parses a Cricsheet Ashwin format match info file.
    These files are formatted as: key, value1, value2...
    For example:
    version, 2.0.0
    info, team, Kolkata Knight Riders
    info, team, Royal Challengers Bangalore
    info, gender, male
    info, season, 2007/08
    info, date, 2008-04-18
    info, venue, M Chinnaswamy Stadium
    info, city, Bangalore
    info, toss_winner, Royal Challengers Bangalore
    info, toss_decision, field
    info, player_of_match, BB McCullum
    info, winner, Kolkata Knight Riders
    info, winner_runs, 140
    info, outcome, tie
    """
    match_id = Path(filepath).stem.replace("_info", "")
    info_data = {"match_id": match_id, "teams": []}
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                parts = [p.strip() for p in line.split(',')]
                if len(parts) < 2:
                    continue
                if parts[0] == "info":
                    key = parts[1]
                    val = parts[2] if len(parts) > 2 else ""
                    if key == "team":
                        info_data["teams"].append(val)
                    else:
                        info_data[key] = val
    except Exception as e:
        logger.error(f"Error parsing info file {filepath}: {e}")
        
    # Standardize teams
    teams = info_data.get("teams", [])
    if len(teams) >= 2:
        info_data["team1"] = teams[0]
        info_data["team2"] = teams[1]
    else:
        info_data["team1"] = None
        info_data["team2"] = None
        
    info_data.pop("teams", None)
    return info_data

def preprocess_and_consolidate():
    """Consolidates individual match CSVs into unified DataFrames."""
    download_dataset()
    extract_dataset()
    
    logger.info("Consolidating match data...")
    csv_files = list(EXTRACT_DIR.glob("*.csv"))
    
    # Check if Cricsheet has pre-consolidated matches (e.g. all_matches.csv)
    consolidated_ball_path = EXTRACT_DIR / "all_matches.csv"
    consolidated_info_path = EXTRACT_DIR / "all_matches_info.csv"
    
    # If they already exist as consolidated files, use them
    if consolidated_ball_path.exists():
        logger.info("Found pre-consolidated all_matches.csv file. Reading directly...")
        df_deliveries = pd.read_csv(consolidated_ball_path, low_memory=False)
        # Check if info file exists, otherwise we generate it by grouping or parsing
        if consolidated_info_path.exists():
            df_matches = pd.read_csv(consolidated_info_path, low_memory=False)
        else:
            # Reconstruct matches from deliveries (if metadata is duplicated in columns)
            # In some Ashwin versions, all_matches.csv has match-level columns
            cols = df_deliveries.columns.tolist()
            if 'toss_winner' in cols and 'winner' in cols:
                logger.info("Reconstructing matches metadata from deliveries...")
                match_cols = ['match_id', 'season', 'start_date', 'venue', 'toss_winner', 'toss_decision', 'winner']
                df_matches = df_deliveries[match_cols].drop_duplicates(subset=['match_id']).copy()
            else:
                logger.info("Parsing individual _info.csv files to build matches metadata...")
                info_files = list(EXTRACT_DIR.glob("*_info.csv"))
                matches_list = [parse_info_file(f) for f in info_files]
                df_matches = pd.DataFrame(matches_list)
    else:
        # We need to consolidate individual match files
        logger.info("Combining individual match CSVs...")
        info_files = list(EXTRACT_DIR.glob("*_info.csv"))
        delivery_files = [f for f in csv_files if not f.name.endswith("_info.csv") and f.name != "README.txt"]
        
        logger.info(f"Found {len(info_files)} match info files and {len(delivery_files)} delivery files.")
        
        # Parse all match info files
        matches_list = []
        for filepath in info_files:
            matches_list.append(parse_info_file(filepath))
        df_matches = pd.DataFrame(matches_list)
        
        # Read and stack all delivery files
        deliveries_list = []
        for filepath in delivery_files:
            match_id = filepath.stem
            try:
                df = pd.read_csv(filepath, low_memory=False)
                df['match_id'] = match_id
                deliveries_list.append(df)
            except Exception as e:
                logger.error(f"Error reading delivery file {filepath}: {e}")
                
        df_deliveries = pd.concat(deliveries_list, ignore_index=True)

    # Save consolidated raw datasets to DATASET_DIR
    df_matches.to_csv(DATASET_DIR / "matches_raw.csv", index=False)
    df_deliveries.to_csv(DATASET_DIR / "deliveries_raw.csv", index=False)
    
    logger.info(f"Raw data consolidated: {len(df_matches)} matches, {len(df_deliveries)} deliveries saved.")
    return df_matches, df_deliveries

if __name__ == "__main__":
    preprocess_and_consolidate()
