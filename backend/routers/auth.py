import os
import resend
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, find_account_by_identifier, update_account_password
from auth_utils import hash_password, create_password_reset_token, verify_password_reset_token

router = APIRouter(prefix="/auth", tags=["Auth & Security"])

# Configure Resend
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
# Target email for dev testing (or grab from env)
NOTIFICATION_EMAIL = os.getenv("DEV_NOTIFICATION_EMAIL", "your_email@example.com")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


class ForgotPasswordPayload(BaseModel):
    identifier: str  # Admin username OR tenant company_name


class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str


def send_password_reset_email(to_email: str, reset_url: str):
    """Dispatches a password reset email via Resend."""
    if not RESEND_API_KEY:
        print("⚠️ RESEND_API_KEY not set. Check console for link:", reset_url)
        return

    try:
        # Note: Free tier without custom domain sends from onboarding@resend.dev
        resend.Emails.send({
            "from": "SaaS Platform <onboarding@resend.dev>",
            "to": [to_email],  # Free tier delivers to your registered account email
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
        print(f"📧 Reset email successfully dispatched to {to_email}")
    except Exception as e:
        print(f"❌ Resend Email Failed: {e}")


@router.post("/forgot-password")
def request_password_reset(payload: ForgotPasswordPayload, db: Session = Depends(get_db)):
    account_type, account = find_account_by_identifier(db, payload.identifier)
    
    generic_response = {"message": "If an account matches that name, a reset token has been generated."}
    
    if not account:
        return generic_response

    # Store identifier + account_type ("admin" or "tenant") in token
    token = create_password_reset_token(
        email=account["identifier"],
        tenant_slug=account_type
    )
    
    reset_url = f"http://localhost:3000/reset-password?token={token}"
    
    # Dev console log for instant testing
    print("\n" + "="*50)
    print(f"🔑 PASSWORD RESET REQUEST")
    print(f"Account Type : {account_type.upper()}")
    print(f"Identifier   : {payload.identifier}")
    print(f"Reset Link   : {reset_url}")
    print("="*50 + "\n")

    # Send email dispatch call fixed here:
    target_email = account.get("email") or NOTIFICATION_EMAIL
    send_password_reset_email(target_email, reset_url)

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