# backend/routers/audit.py
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
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

    if resource:
        query = query.filter(AuditLog.resource == resource)
    if action:
        query = query.filter(AuditLog.action == action)

    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

    # Prevent Pydantic validation errors on null/empty JSONB fields
    for log in logs:
        if log.details is None:
            log.details = {}

    return logs