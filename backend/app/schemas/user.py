from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Raw password, min 6 characters")
    role: str = Field("user", description="user or admin")

class UserResponse(UserBase):
    id: int
    role: str
    full_name: Optional[str] = None
    credits: int
    subscription: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)

class PasswordChange(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    credits: int
    subscription: str

class TokenData(BaseModel):
    username: str | None = None

