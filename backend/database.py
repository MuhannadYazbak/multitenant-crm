import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from fastapi import Header, HTTPException
from typing import Generator

# Read from environment, fallback to default dev DB if not specified
DEFAULT_DB_URL = "postgresql://postgres:My%40postgre@localhost:5432/saas_mvp"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

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