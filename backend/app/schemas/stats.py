from pydantic import BaseModel
from typing import List, Dict

class TeamStats(BaseModel):
    team_name: str
    matches_played: int
    wins: int
    losses: int
    win_rate: float
    form: List[str]  # e.g., ["W", "L", "W", "W", "L"]

class HeadToHeadStats(BaseModel):
    team1: str
    team2: str
    matches_played: int
    team1_wins: int
    team2_wins: int
    team1_win_rate: float
    team2_win_rate: float

class VenueBiasDetail(BaseModel):
    venue: str
    matches_played: int
    batting_first_wins: int
    chasing_wins: int
    chasing_advantage_pct: float
    avg_first_innings_score: float

class OverallStatsResponse(BaseModel):
    total_matches: int
    total_seasons: int
    team_stats: List[TeamStats]
    venue_bias: List[VenueBiasDetail]
