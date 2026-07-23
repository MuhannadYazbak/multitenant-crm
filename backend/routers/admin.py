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
    admin_username: str = Depends(get_current_admin),
):
    existing = (
        db.query(TenantAccount)
        .filter(TenantAccount.company_name == payload.company_name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Company name already registered."
        )

    raw_slug = payload.company_name.lower().replace("-", "_").replace(" ", "_")
    schema_name = f"tenant_{raw_slug}"
    hashed_pwd = hash_password(payload.password)

    try:
        # 1. Create Schema
        db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))

        # 2. Base clients table
        db.execute(
            text(f"""
            CREATE TABLE IF NOT EXISTS "{schema_name}".clients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                email VARCHAR(255),
                address TEXT,
                status VARCHAR(50) DEFAULT 'active',
                custom_fields JSONB DEFAULT '{{}}'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        )

        # 3. Conditional sub-tables
        tenant_type_clean = payload.tenant_type.lower()

        if tenant_type_clean == "legal":
            db.execute(
                text(f"""
                CREATE TABLE IF NOT EXISTS "{schema_name}".legal_cases (
                    id SERIAL PRIMARY KEY,
                    case_number VARCHAR(255),
                    case_type VARCHAR(255),
                    court VARCHAR(255),
                    status VARCHAR(255),
                    client_id INT REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """)
            )

        elif tenant_type_clean == "insurance":
            db.execute(
                text(f"""
                CREATE TABLE IF NOT EXISTS "{schema_name}".insurance_policies (
                    id SERIAL PRIMARY KEY,
                    client_id INT REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                    policy_number VARCHAR(255),
                    coverage_amount NUMERIC(12, 2)
                )
            """)
            )

        # 4. Save Tenant Account
        new_account = TenantAccount(
            company_name=payload.company_name,
            tenant_type=payload.tenant_type,
            password_hash=hashed_pwd,
            status="active",
        )
        db.add(new_account)
        db.commit()
        db.refresh(new_account)

        return new_account

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to provision tenant: {str(e)}"
        )
        
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