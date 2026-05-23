from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...database import connection, crud
from ...schemas import user as user_schemas
from ...core import security
from .auth import get_current_user

router = APIRouter()

@router.put("/profile", response_model=user_schemas.UserResponse)
def update_profile(
    profile_in: user_schemas.UserUpdate,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Updates the authenticated user's profile details (full_name, username).
    Checks that the new username is unique if it's changing.
    """
    if profile_in.username and profile_in.username != current_user.username:
        db_existing = crud.get_user_by_username(db, username=profile_in.username)
        if db_existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken."
            )
            
    updated_user = crud.update_user_profile(
        db=db,
        user_id=current_user.id,
        full_name=profile_in.full_name,
        username=profile_in.username
    )
    return updated_user

@router.put("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_in: user_schemas.PasswordChange,
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Securely updates the user password after verifying their old password.
    """
    if not security.verify_password(password_in.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password."
        )
        
    hashed_pw = security.get_password_hash(password_in.new_password)
    crud.update_user_profile(db=db, user_id=current_user.id, hashed_password=hashed_pw)
    return {"message": "Password updated successfully."}

@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_my_account(
    db: Session = Depends(connection.get_db),
    current_user = Depends(get_current_user)
):
    """
    Permanently deletes the authenticated user's account and all associated prediction and billing logs.
    """
    deleted = crud.delete_user_by_id(db=db, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )
    return {"message": "Account deleted successfully."}

