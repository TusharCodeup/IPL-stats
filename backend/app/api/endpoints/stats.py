import logging
import pandas as pd
from fastapi import APIRouter, HTTPException
from ...core.config import settings
from ...schemas import stats as stats_schemas

logger = logging.getLogger(__name__)

router = APIRouter()

# Global in-memory cache to avoid disk reads on every request
_stats_cache = {}

def get_raw_matches_df():
    """Reads raw matches from CSV and normalizes names."""
    filepath = settings.DATASET_DIR / "matches_raw.csv"
    if not filepath.exists():
        logger.error(f"matches_raw.csv not found at {filepath}")
        return None
    try:
        df = pd.read_csv(filepath)
        # Standardize columns
        from ...ml.train import normalize_team, normalize_venue
        df['team1'] = df['team1'].apply(normalize_team)
        df['team2'] = df['team2'].apply(normalize_team)
        df['winner'] = df['winner'].apply(normalize_team)
        df['toss_winner'] = df['toss_winner'].apply(normalize_team)
        df['venue'] = df['venue'].apply(normalize_venue)
        return df
    except Exception as e:
        logger.error(f"Error reading matches file: {e}")
        return None

@router.get("/teams", response_model=list[str])
def get_teams():
    """Returns the list of active/standard normalized IPL franchises."""
    df = get_raw_matches_df()
    if df is None:
        # Static fallback if data is not generated yet
        return [
            "Chennai Super Kings", "Mumbai Indians", "Royal Challengers Bengaluru", 
            "Kolkata Knight Riders", "Lucknow Super Giants", "Gujarat Titans", 
            "Delhi Capitals", "Sunrisers Hyderabad", "Rajasthan Royals", "Punjab Kings"
        ]
    teams = sorted(list(set(df['team1'].dropna().tolist() + df['team2'].dropna().tolist())))
    # Remove 'Unknown' or invalid teams
    teams = [t for t in teams if t not in ["Unknown", "Other"]]
    return teams

@router.get("/venues", response_model=list[str])
def get_venues():
    """Returns the list of normalized stadiums."""
    df = get_raw_matches_df()
    if df is None:
        return ["Wankhede Stadium", "M Chinnaswamy Stadium", "Eden Gardens", "MA Chidambaram Stadium"]
    venues = sorted(list(df['venue'].dropna().unique()))
    venues = [v for v in venues if v not in ["Unknown", "Other"]]
    return venues

@router.get("/summary", response_model=stats_schemas.OverallStatsResponse)
def get_overall_stats():
    """
    Returns high-level historical statistics including team win records 
    and venue bias details (e.g., chasing advantages).
    """
    global _stats_cache
    if "summary" in _stats_cache:
        return _stats_cache["summary"]

    df = get_raw_matches_df()
    if df is None:
        raise HTTPException(status_code=500, detail="Match statistics data not available yet.")

    try:
        # Drop rows with no winner (draw/abandoned)
        df_clean = df.dropna(subset=['winner']).copy()
        df_clean = df_clean[df_clean['winner'] != "Unknown"]
        df_clean = df_clean[df_clean['outcome'].isna()]  # Exclude ties/abnd

        total_matches = len(df_clean)
        # Parse seasons
        seasons = df_clean['season'].dropna().unique().tolist()
        total_seasons = len(seasons)

        # 1. Team stats calculation
        teams = get_teams()
        team_stats_list = []
        for team in teams:
            t_matches = df_clean[(df_clean['team1'] == team) | (df_clean['team2'] == team)]
            played = len(t_matches)
            wins = len(t_matches[t_matches['winner'] == team])
            losses = played - wins
            win_rate = round(wins / played, 3) if played > 0 else 0.0
            
            # Simple form: take last 5 matches
            t_sorted = t_matches.sort_values('date').tail(5)
            form = []
            for _, r in t_sorted.iterrows():
                form.append("W" if r['winner'] == team else "L")
            
            team_stats_list.append({
                "team_name": team,
                "matches_played": played,
                "wins": wins,
                "losses": losses,
                "win_rate": win_rate,
                "form": form
            })

        # Sort team stats by win rate
        team_stats_list = sorted(team_stats_list, key=lambda x: x["win_rate"], reverse=True)

        # 2. Venue bias calculation
        venue_stats_list = []
        venues = df_clean['venue'].dropna().unique()
        
        # We need average first innings scores, which we compute from deliveries if available.
        # Let's compute it with a fallback or from matching deliveries if possible.
        # But we can also look up a standard average or compute it.
        # Let's check if deliveries_raw.csv exists to fetch innings scores
        del_path = settings.DATASET_DIR / "deliveries_raw.csv"
        avg_scores = {}
        if del_path.exists():
            try:
                # To speed up, we read only necessary columns
                df_del = pd.read_csv(del_path, usecols=['match_id', 'innings', 'runs_off_bat', 'extras'])
                df_del['total_runs'] = df_del['runs_off_bat'] + df_del['extras']
                inn1 = df_del[df_del['innings'] == 1].groupby('match_id')['total_runs'].sum()
                
                # Link to matches to map to venues
                match_venues = df_clean.set_index('match_id')['venue'].to_dict()
                inn1_df = inn1.reset_index()
                inn1_df['venue'] = inn1_df['match_id'].map(match_venues)
                avg_scores = inn1_df.groupby('venue')['total_runs'].mean().to_dict()
            except Exception as e:
                logger.error(f"Error computing average scores from deliveries: {e}")

        for venue in venues:
            v_matches = df_clean[df_clean['venue'] == venue]
            played = len(v_matches)
            if played < 5:  # skip venues with very few matches to avoid bias skew
                continue
                
            chasing_wins = 0
            batting_first_wins = 0
            
            for _, r in v_matches.iterrows():
                t1, t2 = r['team1'], r['team2']
                toss_w = r['toss_winner']
                toss_d = r['toss_decision']
                winner = r['winner']
                
                # Determine chasing team
                if toss_d == 'field':
                    chasing_team = toss_w
                else:
                    chasing_team = t2 if toss_w == t1 else t1
                    
                if winner == chasing_team:
                    chasing_wins += 1
                else:
                    batting_first_wins += 1
                    
            chasing_adv = round((chasing_wins / played) * 100, 1) if played > 0 else 50.0
            avg_score = round(avg_scores.get(venue, 162.5), 1)  # 162.5 is typical baseline
            
            venue_stats_list.append({
                "venue": venue,
                "matches_played": played,
                "batting_first_wins": batting_first_wins,
                "chasing_wins": chasing_wins,
                "chasing_advantage_pct": chasing_adv,
                "avg_first_innings_score": avg_score
            })
            
        # Sort venue stats by matches played
        venue_stats_list = sorted(venue_stats_list, key=lambda x: x["matches_played"], reverse=True)[:15]

        response_data = {
            "total_matches": total_matches,
            "total_seasons": total_seasons,
            "team_stats": team_stats_list,
            "venue_bias": venue_stats_list
        }
        
        # Cache results
        _stats_cache["summary"] = response_data
        return response_data

    except Exception as e:
        logger.error(f"Error generating statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Error compiling match stats: {str(e)}")
