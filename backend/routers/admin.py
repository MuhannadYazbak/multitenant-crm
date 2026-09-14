# backend/routers/admin.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from database import get_db
from models import TenantAccount, Admin, User, Role, UserRole, AuditLog
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


# --- Schemas for Roles, Audit Logs & User Roles ---

class RoleCreatePayload(BaseModel):
    name: str
    description: str | None = None
    permissions: List[str]

class RoleResponsePayload(BaseModel):
    id: int
    name: str
    description: str | None = None
    permissions: List[str]

    class Config:
        from_attributes = True

class AssignRolePayload(BaseModel):
    role_id: int

class AuditLogResponse(BaseModel):
    id: int
    user_email: str
    action: str
    target: str
    timestamp: str

    class Config:
        from_attributes = True


# --- Admin Authentication ---

@router.post("/login", response_model=AdminToken)
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin username or password"
        )

    user_roles = [
        {
            "id": ur.role.id,
            "name": ur.role.name,
            "permissions": ur.role.permissions
        }
        for ur in user.user_roles if ur.role
    ]

    allowed_roles = {"super_admin", "admin"}
    role_names_lower = {r["name"].lower() for r in user_roles}

    if not allowed_roles.intersection(role_names_lower):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Account lacks administrative privileges"
        )

    access_token = create_admin_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "tenant_id": user.tenant_id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "roles": user_roles
        }
    }


@router.post("/seed-initial-admin", status_code=201)
def seed_initial_admin(payload: AdminLogin, db: Session = Depends(get_db)):
    """Helper route to create the first admin user if none exists."""
    existing = db.query(Admin).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin user already exists.")
    
    new_admin = Admin(
        username=payload.username,
        password_hash=hash_password(payload.password)
    )
    db.add(new_admin)
    db.commit()
    return {"message": f"Admin user '{payload.username}' created successfully!"}


# --- Role & Permission Management ---

@router.post("/roles", response_model=RoleResponsePayload, status_code=201)
def create_role(
    payload: RoleCreatePayload,
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    existing = db.query(Role).filter(Role.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Role '{payload.name}' already exists.")

    new_role = Role(
        name=payload.name,
        description=payload.description,
        permissions=payload.permissions
    )
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role


@router.get("/roles", response_model=List[RoleResponsePayload])
def list_roles(
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    return db.query(Role).all()


@router.post("/users/{user_id}/roles", status_code=200)
def assign_role_to_user(
    user_id: int,
    payload: AssignRolePayload,
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")

    existing_link = (
        db.query(UserRole)
        .filter(UserRole.user_id == user_id, UserRole.role_id == payload.role_id)
        .first()
    )
    if existing_link:
        raise HTTPException(status_code=400, detail="User already has this role.")

    user_role = UserRole(user_id=user_id, role_id=payload.role_id)
    db.add(user_role)
    
    # Audit log
    db.add(AuditLog(
    user_email=admin_username,
    action="ROLE_ASSIGNED",
    resource="roles",
    details={"target_user_id": user_id, "role_id": payload.role_id, "role_name": role.name}
))

    db.commit()

    return {"message": f"Role '{role.name}' assigned to user successfully."}


@router.delete("/users/{user_id}/roles/{role_id}", status_code=200)
def revoke_role_from_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    user_role = (
        db.query(UserRole)
        .filter(UserRole.user_id == user_id, UserRole.role_id == role_id)
        .first()
    )
    if not user_role:
        raise HTTPException(status_code=404, detail="Role assignment not found for this user.")

    role_name = user_role.role.name if user_role.role else f"Role #{role_id}"
    db.delete(user_role)

    # Audit log
    db.add(AuditLog(
    user_email=admin_username,
    action="ROLE_REVOKED",
    resource="roles",
    details={"target_user_id": user_id, "role_id": role_id}
    ))

    db.commit()
    return {"message": "Role revoked successfully."}


# --- Audit Logs Endpoint ---

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    db: Session = Depends(get_db),
    admin_username: str = Depends(get_current_admin)
):
    """Retrieves all system audit log entries in reverse chronological order."""
    return db.query(AuditLog).order_by(AuditLog.id.desc()).all()


# --- Tenant Provisioning & Management ---

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
    tenant_type_clean = payload.tenant_type.lower()

    try:
        # 1. Create Dedicated Schema
        db.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))

        # 2. Base Clients Table
        db.execute(
            text(f"""
            CREATE TABLE IF NOT EXISTS "{schema_name}".clients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                address VARCHAR(250),
                status VARCHAR(50) DEFAULT 'active',
                custom_fields JSONB NOT NULL DEFAULT '{{}}'::jsonb
            );
        """)
        )

        # 3. Vertical Tables
        if tenant_type_clean == "legal":
            db.execute(text(f"""
                CREATE TABLE IF NOT EXISTS "{schema_name}".legal_cases (
                    id SERIAL PRIMARY KEY,
                    client_id INT NOT NULL REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                    case_number VARCHAR(100) NOT NULL,
                    case_type VARCHAR(100) NOT NULL,
                    court VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'Open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

        elif tenant_type_clean == "insurance":
            db.execute(text(f"""
                CREATE TABLE IF NOT EXISTS "{schema_name}".insurance_policies (
                    id SERIAL PRIMARY KEY,
                    client_id INT NOT NULL REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                    policy_number VARCHAR(100) NOT NULL,
                    policy_type VARCHAR(100) DEFAULT 'General',
                    coverage_amount NUMERIC(12, 2),
                    deductible NUMERIC(10, 2) DEFAULT 0.00,
                    status VARCHAR(50) DEFAULT 'Active',
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

        # 4. Universal Sub-Resource Tables
        case_fk_clause = f'REFERENCES "{schema_name}".legal_cases(id) ON DELETE CASCADE' if tenant_type_clean == "legal" else ""
        policy_fk_clause = f'REFERENCES "{schema_name}".insurance_policies(id) ON DELETE CASCADE' if tenant_type_clean == "insurance" else ""

        db.execute(text(f"""
            CREATE TABLE IF NOT EXISTS "{schema_name}".notes (
                id SERIAL PRIMARY KEY,
                author_name VARCHAR(100) NOT NULL DEFAULT 'System User',
                note_type VARCHAR(50) DEFAULT 'General',
                content TEXT NOT NULL,
                is_pinned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                client_id INT REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                case_id INT {case_fk_clause},
                policy_id INT {policy_fk_clause}
            );
        """))

        db.execute(text(f"""
            CREATE TABLE IF NOT EXISTS "{schema_name}".documents (
                id SERIAL PRIMARY KEY,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(50),
                file_category VARCHAR(50) DEFAULT 'General',
                file_size_bytes BIGINT,
                is_archived BOOLEAN DEFAULT FALSE,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                client_id INT REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                case_id INT {case_fk_clause},
                policy_id INT {policy_fk_clause}
            );
        """))

        db.execute(text(f"""
            CREATE TABLE IF NOT EXISTS "{schema_name}".billing_entries (
                id SERIAL PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                hours NUMERIC(6, 2),
                rate NUMERIC(10, 2),
                total_amount NUMERIC(10, 2) NOT NULL,
                is_paid BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                client_id INT REFERENCES "{schema_name}".clients(id) ON DELETE CASCADE,
                case_id INT {case_fk_clause},
                policy_id INT {policy_fk_clause}
            );
        """))

        # 5. Save Global Tenant Account in Public Schema
        new_account = TenantAccount(
            company_name=payload.company_name,
            tenant_type=payload.tenant_type,
            password_hash=hashed_pwd,
            status="active",
        )
        db.add(new_account)
        db.flush()  # Flushes to populate new_account.id

        # 6. Create Initial Tenant Manager User
        manager_email = f"manager@{payload.company_name.lower().replace(' ', '')}.com"
        manager_user = User(
            tenant_id=new_account.id,
            email=manager_email,
            password_hash=hashed_pwd,
            full_name=f"{payload.company_name} Manager",
            is_active=True
        )
        db.add(manager_user)
        db.flush()

        # Assign "Manager" or "Admin" Role if exists
        manager_role = db.query(Role).filter(Role.name.ilike("Manager")).first() or db.query(Role).filter(Role.name.ilike("Admin")).first()
        if manager_role:
            db.add(UserRole(user_id=manager_user.id, role_id=manager_role.id))

        # 7. Record System Audit Log Entry
        db.add(AuditLog(
            user_email=admin_username,
            action="TENANT_PROVISIONED",
            resource="tenants",
            details={"company_name": payload.company_name, "tenant_type": payload.tenant_type}
        ))

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
    
    old_status = tenant.status
    tenant.status = payload.status

    # Record Audit Log
    db.add(AuditLog(
        user_email=admin_username,
        action=f"TENANT_STATUS_{payload.status.upper()} (was {old_status.upper()})",
        resource="tenants",
        details={"company_name": company_name, "previous_status": old_status, "new_status": payload.status}
    ))

    db.commit()
    db.refresh(tenant)
    return tenant