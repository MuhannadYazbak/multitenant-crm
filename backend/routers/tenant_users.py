# backend/routers/tenant_users.py
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
from database import get_db, get_db_for_tenant
from security import hash_password
from auth_utils import get_current_user
from rbac import require_permission
from audit import log_activity

router = APIRouter(prefix="/api/tenant/users", tags=["Tenant User Management"])

# --- Pydantic Schemas ---

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role_id: int

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    role_id: Optional[int]
    role_name: str
    created_at: str
    last_active: Optional[str] = None
    last_action: Optional[str] = None

    class Config:
        from_attributes = True


# --- Endpoints ---

@router.get("", response_model=List[UserResponse])
def get_tenant_users(
    db: Session = Depends(get_db_for_tenant),
    current_user: models.User = Depends(get_current_user)
):
    """
    Fetch all users in the current tenant with their primary role 
    and their latest audit log activity timestamp.
    """
    # Subquery to get the latest activity timestamp per user
    last_log_subquery = (
        db.query(
            models.AuditLog.user_id,
            func.max(models.AuditLog.created_at).label("last_active")
        )
        .group_by(models.AuditLog.user_id)
        .subquery()
    )

    # Fetch users belonging to this tenant
    users = db.query(models.User).filter(models.User.tenant_id == current_user.tenant_id).all()

    response = []
    for user in users:
        # Get assigned primary role
        primary_user_role = db.query(models.UserRole).filter(models.UserRole.user_id == user.id).first()
        role_name = primary_user_role.role.name if primary_user_role and primary_user_role.role else "No Role"
        role_id = primary_user_role.role_id if primary_user_role else None

        # Fetch last log entry
        latest_log = (
            db.query(models.AuditLog)
            .filter(models.AuditLog.user_id == user.id)
            .order_by(models.AuditLog.created_at.desc())
            .first()
        )

        response.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "is_active": user.is_active,
            "role_id": role_id,
            "role_name": role_name,
            "created_at": user.created_at.isoformat() if user.created_at else "",
            "last_active": latest_log.created_at.isoformat() if latest_log and latest_log.created_at else None,
            "last_action": latest_log.action if latest_log else None,
        })

    return response


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_tenant_user(
    payload: UserCreate,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new user within the manager's tenant space.
    """
    # Check if email is already registered in public.users
    existing = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email address already exists.")

    # Check if target role exists
    role = db.query(models.Role).filter(models.Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Selected role does not exist.")

    # Hash password & create user under current manager's tenant_id
    hashed_password = hash_password(payload.password)
    new_user = models.User(
        tenant_id=current_user.tenant_id,
        email=payload.email.lower().strip(),
        password_hash=hashed_password,
        full_name=payload.full_name.strip(),
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Assign role
    user_role = models.UserRole(user_id=new_user.id, role_id=role.id)
    db.add(user_role)

    # Log action in audit logs
    log_activity(
        db=db,
        action="USER_CREATED",
        resource="users",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"created_user_id": new_user.id, "created_user_email": new_user.email, "assigned_role": role.name},
        request=request
    )

    db.commit()

    return {
        "id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "is_active": new_user.is_active,
        "role_id": role.id,
        "role_name": role.name,
        "created_at": new_user.created_at.isoformat() if new_user.created_at else "",
        "last_active": None,
        "last_action": None
    }


@router.put("/{user_id}", response_model=UserResponse)
def update_tenant_user(
    user_id: int,
    payload: UserUpdate,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update a user's role, name, or active status within the same tenant.
    """
    target_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found in your tenant.")

    if payload.full_name is not None:
        target_user.full_name = payload.full_name.strip()

    if payload.is_active is not None:
        if target_user.id == current_user.id and not payload.is_active:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")
        target_user.is_active = payload.is_active

    # Update role if provided
    role_name = "No Role"
    role_id = None
    if payload.role_id is not None:
        role = db.query(models.Role).filter(models.Role.id == payload.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Selected role does not exist.")
        
        # Remove old role, set new role
        db.query(models.UserRole).filter(models.UserRole.user_id == target_user.id).delete()
        new_role = models.UserRole(user_id=target_user.id, role_id=role.id)
        db.add(new_role)
        role_id = role.id
        role_name = role.name
    else:
        existing_role = db.query(models.UserRole).filter(models.UserRole.user_id == target_user.id).first()
        if existing_role and existing_role.role:
            role_id = existing_role.role_id
            role_name = existing_role.role.name

    log_activity(
        db=db,
        action="USER_UPDATED",
        resource="users",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"updated_user_id": target_user.id, "is_active": target_user.is_active},
        request=request
    )

    db.commit()

    return {
        "id": target_user.id,
        "full_name": target_user.full_name,
        "email": target_user.email,
        "is_active": target_user.is_active,
        "role_id": role_id,
        "role_name": role_name,
        "created_at": target_user.created_at.isoformat() if target_user.created_at else "",
        "last_active": None,
        "last_action": None
    }


@router.delete("/{user_id}")
def soft_delete_tenant_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: models.User = Depends(get_current_user)
):
    """
    Soft delete (deactivate) a tenant user.
    """
    target_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found in your tenant.")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")

    target_user.is_active = False

    log_activity(
        db=db,
        action="USER_DEACTIVATED",
        resource="users",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"deactivated_user_id": target_user.id, "email": target_user.email},
        request=request
    )

    db.commit()
    return {"message": f"User '{target_user.full_name}' deactivated successfully."}