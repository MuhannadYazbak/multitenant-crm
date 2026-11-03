# backend/rbac.py
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole, Role
from auth_utils import get_current_user


@lru_cache
def require_permission(required_permission: str):
    """
    Dependency generator to verify if the authenticated user has the required permission.
    Supports wildcard '*:*' for full admin access.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Fetch user's assigned roles
        user_roles = (
            db.query(Role)
            .join(UserRole, Role.id == UserRole.role_id)
            .filter(UserRole.user_id == current_user.id)
            .all()
        )

        # Flatten user permissions across all assigned roles
        user_permissions = set()
        for role in user_roles:
            if role.permissions:
                user_permissions.update(role.permissions)

        # Check for super-admin wildcard or explicit permission match
        if "*:*" in user_permissions or required_permission in user_permissions:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Missing required permission: '{required_permission}'"
        )

    return permission_checker