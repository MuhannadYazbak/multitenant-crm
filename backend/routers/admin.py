from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from database import get_db
from security import hash_password  # <--- Import native hash function

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Tenant Onboarding"]
)

ADMIN_SECRET_KEY = "super_secret_admin_key_123"

class TenantCreate(BaseModel):
    company_name: str
    password: str
    tenant_type: str = "general"

@router.post("/tenants", status_code=status.HTTP_201_CREATED)
def onboard_tenant(
    tenant_data: TenantCreate, 
    db: Session = Depends(get_db),
    x_admin_secret: str = Header(None)
):
    if x_admin_secret != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Unauthorized admin access"
        )

    raw_name = tenant_data.company_name.strip().lower()
    safe_tenant = "".join(c for c in raw_name if c.isalnum() or c in "-_").replace("-", "_")
    
    if not safe_tenant:
        raise HTTPException(status_code=400, detail="Invalid company name")

    schema_name = f"tenant_{safe_tenant}"

    existing = db.execute(
        text("SELECT id FROM public.tenant_accounts WHERE company_name = :c"),
        {"c": safe_tenant}
    ).fetchone()

    if existing:
        raise HTTPException(status_code=400, detail=f"Tenant '{safe_tenant}' already exists.")

    # Hash using your native security.py helper!
    hashed_password = hash_password(tenant_data.password)

    try:
        # A. Store in public.tenant_accounts
        db.execute(
            text("""
                INSERT INTO public.tenant_accounts (company_name, password_hash, tenant_type)
                VALUES (:c, :p, :t)
            """),
            {"c": safe_tenant, "p": hashed_password, "t": tenant_data.tenant_type}
        )

        # B. Create schema
        db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))

        # C. Create schema tables
        db.execute(text(f"""
            CREATE TABLE IF NOT EXISTS "{schema_name}".clients (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                phone VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                address VARCHAR,
                status VARCHAR DEFAULT 'active',
                custom_fields JSONB DEFAULT '{{}}'::jsonb NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "{schema_name}".insurance_policies (
                id SERIAL PRIMARY KEY,
                client_id INT NOT NULL REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                policy_number VARCHAR NOT NULL,
                coverage_amount NUMERIC(12, 2)
            );

            CREATE TABLE IF NOT EXISTS "{schema_name}".legal_cases (
                id SERIAL PRIMARY KEY,
                case_number VARCHAR NOT NULL,
                case_type VARCHAR NOT NULL,
                court VARCHAR,
                status VARCHAR DEFAULT 'Open',
                client_id INT NOT NULL REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))

        db.commit()

        return {
            "status": "success",
            "message": f"Tenant '{safe_tenant}' successfully onboarded!",
            "schema": schema_name,
            "tenant_type": tenant_data.tenant_type
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to onboard tenant: {str(e)}")