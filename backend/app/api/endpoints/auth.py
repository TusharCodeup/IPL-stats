from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...database import connection, crud
from ...schemas import user as user_schemas
from ...core import security
from ...core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(connection.get_db)):
    """Dependency to retrieve and authorize the current user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = security.decode_access_token(token)
    if username is None:
        raise credentials_exception
        
    db_user = crud.get_user_by_username(db, username=username)
    if db_user is None:
        raise credentials_exception
    return db_user

def get_current_admin(current_user = Depends(get_current_user)):
    """Dependency to restrict route access to Admin users only."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges."
        )
    return current_user

@router.post("/register", response_model=user_schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: user_schemas.UserCreate, db: Session = Depends(connection.get_db)):
    """Registers a new user after checking if the username is unique."""
    db_user = crud.get_user_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    
    hashed_pw = security.get_password_hash(user_in.password)
    # Automatically promote first user to admin or keep simple roles
    # Let's support user_in.role but limit to valid choices
    role = user_in.role if user_in.role in ["user", "admin"] else "user"
    
    # Check if this is the first user; if so, make them admin
    # Let's keep it simple and default to whatever role is requested.
    
    new_user = crud.create_user(db, username=user_in.username, hashed_pw=hashed_pw, role=role)
    return new_user

@router.post("/token", response_model=user_schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(connection.get_db)):
    """Logs in a user, returning a JWT access token and user role."""
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "credits": user.credits,
        "subscription": user.subscription
    }


@router.get("/me", response_model=user_schemas.UserResponse)
def read_users_me(current_user = Depends(get_current_user)):
    """Returns details of the currently authenticated user."""
    return current_user
