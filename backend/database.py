import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from fastapi import Header, HTTPException
from typing import Generator
from dotenv import load_dotenv
import logging

# Load variables from .env
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:My%40postgre@localhost:5432/saas_mvp"
)
SECRET_KEY = os.getenv("SECRET_KEY", "default_fallback_key_32_characters_min")

engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_tenant_metadata(db: Session, tenant_id: str) -> dict:
    """Queries public.tenant_accounts table to verify tenant workspace."""
    result = db.execute(
        text("SELECT company_name, tenant_type FROM public.tenant_accounts WHERE company_name = :t"),
        {"t": tenant_id}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Tenant workspace not found")

    # If tenant_type is null or missing on a row, default appropriately or return stored type
    tenant_type = result.tenant_type or "general"

    return {"id": result.company_name, "type": tenant_type}


def get_db_for_tenant(x_tenant: str = Header(None)) -> Generator[Session, None, None]:
    if not x_tenant:
        raise HTTPException(status_code=400, detail="X-Tenant header is required")

    db = SessionLocal()
    try:
        safe_tenant = "".join(c for c in x_tenant if c.isalnum() or c in "-_").lower()
        
        # 1. Look up the tenant metadata from public.tenant_accounts
        tenant_account = db.execute(
            text("SELECT tenant_type FROM public.tenant_accounts WHERE company_name = :t"),
            {"t": safe_tenant}
        ).fetchone()

        # 2. Store the tenant_type directly inside SQLAlchemy's db.info session dictionary
        if tenant_account:
            db.info["tenant_type"] = tenant_account.tenant_type or "general"
        else:
            db.info["tenant_type"] = "general"

        # 3. Set schema search path
        schema_name = f"tenant_{safe_tenant.replace('-', '_')}"
        db.execute(text(f'SET search_path TO "{schema_name}", public'))

        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.rollback()
        try:
            db.execute(text("RESET search_path"))
        except Exception:
            pass
        db.close()

def find_account_by_identifier(db: Session, identifier: str):
    """
    Checks public.admins first (by username), 
    then public.tenant_accounts (by company_name).
    Returns (account_type, account_data) or (None, None).
    """
    # 1. Check Superadmins (public.admins)
    admin_result = db.execute(
        text("SELECT username, password_hash FROM public.admins WHERE username = :id"),
        {"id": identifier}
    ).fetchone()

    if admin_result:
        return "admin", {
            "identifier": admin_result.username,
            "hash": admin_result.password_hash
        }

    # 2. Check Tenant Accounts (public.tenant_accounts)
    tenant_result = db.execute(
        text("SELECT id, company_name, password_hash, status FROM public.tenant_accounts WHERE company_name = :id"),
        {"id": identifier}
    ).fetchone()

    if tenant_result:
        return "tenant", {
            "id": tenant_result.id,
            "identifier": tenant_result.company_name,
            "hash": tenant_result.password_hash
        }

    return None, None


def update_account_password(db: Session, account_type: str, identifier: str, new_password_hash: str):
    """
    Updates the password hash in the appropriate table based on account_type.
    """
    if account_type == "admin":
        db.execute(
            text("UPDATE public.admins SET password_hash = :hash WHERE username = :id"),
            {"hash": new_password_hash, "id": identifier}
        )
        db.commit()
    elif account_type == "tenant":
        db.execute(
            text("UPDATE public.tenant_accounts SET password_hash = :hash WHERE company_name = :id"),
            {"hash": new_password_hash, "id": identifier}
        )
        db.commit()
    else:
        raise ValueError(f"Invalid account type: {account_type}")