# # backend/routers/audit.py
# from typing import List, Optional
# from fastapi import APIRouter, Depends, Query, HTTPException
# from sqlalchemy.orm import Session
# from database import get_db
# from models import AuditLog, User
# from schemas import AuditLogResponse
# from auth_utils import get_current_user
# from rbac import require_permission

# router = APIRouter(prefix="/api/v1/audit-logs", tags=["Audit Logs"])

# @router.get(
#     "/",
#     response_model=List[AuditLogResponse],
#     dependencies=[Depends(require_permission("audit:read"))]
# )
# def get_audit_logs(
#     resource: Optional[str] = Query(None, description="Filter logs by resource"),
#     action: Optional[str] = Query(None, description="Filter logs by action"),
#     limit: int = Query(50, ge=1, le=200),
#     offset: int = Query(0, ge=0),
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     query = db.query(AuditLog)

#     # --- Role-Based Scoping ---
#     if current_user.role_id in [1,4]:
#         # Admin or Super Admin: Sees all logs across all tenants
#         pass
#     elif current_user.role_id == 2:
#         # Tenant Manager (2): All logs for their tenant
#         query = query.filter(AuditLog.tenant_id == current_user.tenant_id)
#     else:
#         # Editors (5) & Viewers (3): Only their own single most recent log
#         query = query.filter(
#             AuditLog.tenant_id == current_user.tenant_id,
#             AuditLog.user_id == current_user.id
#         )
#         limit = 1
#         offset = 0

#     # --- Filters ---
#     if resource:
#         query = query.filter(AuditLog.resource == resource)
#     if action:
#         query = query.filter(AuditLog.action == action)

#     logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

#     # Prevent Pydantic validation errors on null/empty JSONB fields
#     for log in logs:
#         if log.details is None:
#             log.details = {}

#     return logs

# backend/routers/audit.py
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import AuditLog, User
from schemas import AuditLogResponse
from auth_utils import get_current_user
from rbac import require_permission

router = APIRouter(prefix="/api/v1/audit-logs", tags=["Audit Logs"])

@router.get(
    "/",
    response_model=List[AuditLogResponse],
    dependencies=[Depends(require_permission("audit:read"))]
)
def get_audit_logs(
    resource: Optional[str] = Query(None, description="Filter logs by resource"),
    action: Optional[str] = Query(None, description="Filter logs by action"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)

    # Fetch role IDs for current user from user_roles junction table
    user_role_ids = [
        row[0] for row in db.execute(
            text("SELECT role_id FROM user_roles WHERE user_id = :uid"),
            {"uid": current_user.id}
        ).fetchall()
    ]

    # --- Role-Based Scoping ---
    if any(r in [1, 4] for r in user_role_ids):
        # Admin (1) & Super Admin (4): See all logs across system
        pass

    elif 2 in user_role_ids:
        # Tenant Manager (2): See ALL logs for their tenant workspace
        if current_user.tenant_id:
            query = query.filter(
                (AuditLog.tenant_id == current_user.tenant_id) |
                (AuditLog.user_email.in_(
                    db.query(User.email).filter(User.tenant_id == current_user.tenant_id)
                ))
            )
        else:
            query = query.filter(AuditLog.user_email == current_user.email)

    else:
        # Viewer (3) & Editor (5): See only their own logs
        query = query.filter(
            AuditLog.tenant_id == current_user.tenant_id,
            AuditLog.user_id == current_user.id
        )

    # --- Filters ---
    if resource:
        query = query.filter(AuditLog.resource == resource)
    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

    for log in logs:
        if log.details is None:
            log.details = {}

    return logs