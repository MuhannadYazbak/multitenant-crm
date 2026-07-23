# backend/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db
from models import TenantAccount, Admin
from schemas import (
    TenantCreate, 
    TenantResponse, 
    TenantStatusUpdate, 
    AdminLogin, 
    AdminToken
)
from auth_utils import (
    hash_password, 
    verify_password, 
    create_admin_access_token, 
    get_current_admin
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

# --- Admin Authentication ---

@router.post("/login", response_model=AdminToken)
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == payload.username).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin username or password"
        )
    
    access_token = create_admin_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/seed-initial-admin", status_code=201)
def seed_initial_admin(payload: AdminLogin, db: Session = Depends(get_db)):
    """Helper route to create the first admin user if none exists."""
    existing = db.query(Admin).filter(Admin.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin user already exists.")
    
    new_admin = Admin(
        username=payload.username,
        password_hash=hash_password(payload.password)
    )
    db.add(new_admin)
    db.commit()
    return {"message": f"Admin user '{payload.username}' created successfully!"}


# --- Tenant Provisioning & Management (Protected by Admin JWT) ---

@router.post("/tenants", response_model=TenantResponse, status_code=201)
def onboard_tenant(
    payload: TenantCreate, 
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    existing = db.query(TenantAccount).filter(TenantAccount.company_name == payload.company_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company name already registered.")

    schema_name = f"tenant_{payload.company_name.lower().replace('-', '_')}"
    hashed_pwd = hash_password(payload.password)

    try:
        db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))
        db.execute(text(f'''
            CREATE TABLE IF NOT EXISTS "{schema_name}".users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        '''))
        
        new_account = TenantAccount(
            company_name=payload.company_name,
            tenant_type=payload.tenant_type,
            password_hash=hashed_pwd,
            status="active"
        )
        db.add(new_account)
        db.commit()
        db.refresh(new_account)
        return new_account

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to provision tenant: {str(e)}")


@router.get("/tenants", response_model=list[TenantResponse])
def list_tenants(
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    """Lists all tenants regardless of status."""
    return db.query(TenantAccount).order_by(TenantAccount.id.asc()).all()


@router.patch("/tenants/{company_name}/status", response_model=TenantResponse)
def update_tenant_status(
    company_name: str,
    payload: TenantStatusUpdate,
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    tenant = db.query(TenantAccount).filter(TenantAccount.company_name == company_name).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant workspace not found.")
    
    tenant.status = payload.status
    db.commit()
    db.refresh(tenant)
    return tenant