from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional

class ContributionDetail(BaseModel):
    feature: str
    impact: str
    type: str  # 'positive' or 'negative'
    description: str

class ExplanationSchema(BaseModel):
    predicted_winner: str
    probability: float
    summary: str
    contributions: List[ContributionDetail]

class PreMatchRequest(BaseModel):
    team1: str = Field(..., description="Name of Team 1")
    team2: str = Field(..., description="Name of Team 2")
    venue: str = Field(..., description="Venue name")
    toss_winner: str = Field(..., description="Name of Toss Winner")
    toss_decision: str = Field(..., description="Decision ('field' or 'bat')")

    @model_validator(mode='after')
    def validate_teams(self):
        if self.team1.strip().lower() == self.team2.strip().lower():
            raise ValueError("Team 1 and Team 2 cannot be the same franchise.")
        if self.toss_winner.strip().lower() not in [self.team1.strip().lower(), self.team2.strip().lower()]:
            raise ValueError("Toss winner must be either Team 1 or Team 2.")
        if self.toss_decision.strip().lower() not in ["field", "bat"]:
            raise ValueError("Toss decision must be either 'field' or 'bat'.")
        return self

class PreMatchResponse(BaseModel):
    team1_probability: float
    team2_probability: float
    predicted_winner: str
    model_used: str
    explanation: Optional[ExplanationSchema] = None

class LiveChaseRequest(BaseModel):
    batting_team: str = Field(..., description="Batting team name")
    bowling_team: str = Field(..., description="Bowling team name")
    venue: str = Field(..., description="Venue name")
    target_runs: int = Field(..., description="Runs needed to win + 1")
    current_runs: int = Field(..., description="Runs scored so far")
    wickets_lost: int = Field(..., description="Wickets down (0-10)")
    balls_bowled: int = Field(..., description="Overs bowled converted to total legal balls (0-120)")

    @field_validator('target_runs')
    @classmethod
    def validate_target(cls, v):
        if v <= 0:
            raise ValueError("Target runs must be a positive integer greater than 0.")
        return v

    @field_validator('current_runs')
    @classmethod
    def validate_current_runs(cls, v):
        if v < 0:
            raise ValueError("Current runs cannot be negative.")
        return v

    @field_validator('wickets_lost')
    @classmethod
    def validate_wickets(cls, v):
        if not (0 <= v <= 10):
            raise ValueError("Wickets lost must be an integer between 0 and 10.")
        return v

    @field_validator('balls_bowled')
    @classmethod
    def validate_balls(cls, v):
        if not (0 <= v <= 120):
            raise ValueError("Balls bowled must be an integer between 0 and 120.")
        return v

    @model_validator(mode='after')
    def validate_game_state(self):
        if self.batting_team.strip().lower() == self.bowling_team.strip().lower():
            raise ValueError("Batting and bowling teams cannot be the same.")
        return self

class LiveChaseResponse(BaseModel):
    batting_team_probability: float
    bowling_team_probability: float
    crr: float
    rrr: float
    model_used: str
