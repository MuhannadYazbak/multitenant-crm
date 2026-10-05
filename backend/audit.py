# backend/audit.py
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request
from models import AuditLog

def log_activity(
    db: Session,
    action: str,
    resource: str,
    tenant_id: Optional[int] = None,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None
):
    """
    Creates an audit log record in the current database session.
    Automatically extracts client IP from FastAPI Request if provided.
    Appends to active transaction; caller manages db.commit().
    """
    ip_address = None
    if request:
        ip_address = request.client.host if request.client else None
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()

    audit_entry = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        user_email=user_email,
        action=action,
        resource=resource,
        details=details or {},
        ip_address=ip_address
    )
    
    db.add(audit_entry)
    # Do NOT call db.commit() here! Let the parent route (e.g., main.py) commit the whole unit of work.
    return audit_entry