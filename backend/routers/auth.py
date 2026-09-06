import os
import resend
from typing import List, Set
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db, find_account_by_identifier, update_account_password
from auth_utils import (
    hash_password,
    verify_password,
    create_user_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    get_current_user
)
from models import User, UserRole, Role

router = APIRouter(prefix="/auth", tags=["Auth & Security"])

# Environment Detection
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
IS_DEV_OR_TEST = ENVIRONMENT in ["development", "test"]

# Configure Resend
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
NOTIFICATION_EMAIL = os.getenv("DEV_NOTIFICATION_EMAIL", "your_email@example.com")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


# --- Schemas ---

class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserMeResponse(BaseModel):
    id: int
    email: str
    roles: List[RoleResponse]
    permissions: List[str]

    class Config:
        from_attributes = True


class ForgotPasswordPayload(BaseModel):
    identifier: str  # Admin username OR tenant company_name


class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str


# --- Helper Function for Permission Extraction ---

def get_user_permissions(db: Session, user_id: int) -> tuple[List[Role], List[str]]:
    """Fetches assigned roles and flattens unique permissions for a given user."""
    user_roles = (
        db.query(Role)
        .join(UserRole, Role.id == UserRole.role_id)
        .filter(UserRole.user_id == user_id)
        .all()
    )

    permissions: Set[str] = set()
    for role in user_roles:
        if role.permissions:
            permissions.update(role.permissions)

    return user_roles, list(permissions)


# --- Endpoints ---

@router.post("/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    """Authenticates user credentials and returns JWT token along with permissions."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    _, permissions = get_user_permissions(db, user.id)
    token = create_user_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "permissions": permissions
    }


@router.get("/me", response_model=UserMeResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns profile information for the authenticated user including assigned roles and permissions."""
    roles, permissions = get_user_permissions(db, current_user.id)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "roles": roles,
        "permissions": permissions
    }


def send_password_reset_email(to_email: str, reset_url: str):
    """Dispatches a password reset email via Resend."""
    if not RESEND_API_KEY:
        print("⚠️ RESEND_API_KEY not set. Check console for link:", reset_url)
        return

    try:
        resend.Emails.send({
            "from": "SaaS Platform <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "🔑 Reset Your Password",
            "html": f"""
                <div style="font-family: sans-serif; padding: 20px; max-width: 500px;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your account.</p>
                    <p>Click the button below to choose a new password (link valid for 15 minutes):</p>
                    <a href="{reset_url}" 
                       style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #2563eb; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Reset Password
                    </a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                        If you did not request this, you can safely ignore this email.
                    </p>
                </div>
            """
        })
        print(f"[EMAIL] Reset email successfully dispatched to {to_email}")
    except Exception as e:
        print(f"[ERROR] Resend Email Failed: {e}")


@router.post("/forgot-password")
def request_password_reset(payload: ForgotPasswordPayload, db: Session = Depends(get_db)):
    account_type, account = find_account_by_identifier(db, payload.identifier)
    
    generic_response = {"message": "If an account matches that name, a reset token has been generated."}
    
    if not account:
        return generic_response

    token = create_password_reset_token(
        email=account["identifier"],
        tenant_slug=account_type
    )
    
    reset_url = f"http://localhost:3000/reset-password?token={token}"
    
    print("\n" + "="*50)
    print(f"[AUTH] PASSWORD RESET REQUEST")
    print(f"Account Type : {account_type.upper()}")
    print(f"Identifier   : {payload.identifier}")
    print(f"Reset Link   : {reset_url}")
    print("="*50 + "\n")

    target_email = account.get("email") or NOTIFICATION_EMAIL
    send_password_reset_email(target_email, reset_url)

    if IS_DEV_OR_TEST:
        return {
            **generic_response,
            "dev_reset_url": reset_url,
            "dev_token": token
        }

    return generic_response


@router.post("/reset-password")
def execute_password_reset(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    token_data = verify_password_reset_token(payload.token)
    
    identifier = token_data.get("sub")
    account_type = token_data.get("tenant")
    
    if not identifier or not account_type:
        raise HTTPException(status_code=400, detail="Invalid token payload")
        
    hashed_pwd = hash_password(payload.new_password)
    update_account_password(db, account_type, identifier, hashed_pwd)
    
    return {"message": "Password updated successfully! You can now log in with your new credentials."}