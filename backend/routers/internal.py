# backend/routers/internal.py
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import TenantAccount, User
from rbac import require_permission
from audit import log_activity  # Adjust import path based on your audit module location

router = APIRouter(prefix="/api/internal", tags=["Internal"])


@router.post("/tenants/{tenant_identifier}/activate-subscription")
def activate_subscription(
    tenant_identifier: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("tenants:billing"))
):
    """
    Activates or updates a tenant's subscription plan.
    Requires 'tenants:billing' permission.
    """
    # 1. Fetch Tenant
    if tenant_identifier.isdigit():
        tenant = db.query(TenantAccount).filter(TenantAccount.id == int(tenant_identifier)).first()
    else:
        tenant = db.query(TenantAccount).filter(
            func.lower(TenantAccount.company_name) == tenant_identifier.lower()
        ).first()

    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant '{tenant_identifier}' not found")

    # 2. Extract keys flexibly
    cust_id = payload.get("customer_id") or payload.get("customer")
    sub_id = payload.get("subscription_id") or payload.get("subscription")

    # 3. Handle Period End safely
    period_end = payload.get("period_end")
    if period_end and isinstance(period_end, (int, float)):
        end_date = datetime.fromtimestamp(period_end, tz=timezone.utc)
    else:
        end_date = datetime.now(timezone.utc) + timedelta(days=30)

    # 4. Perform Direct Bulk UPDATE
    db.query(TenantAccount).filter(TenantAccount.id == tenant.id).update(
        {
            TenantAccount.subscription_status: "ACTIVE",
            TenantAccount.stripe_customer_id: cust_id,
            TenantAccount.stripe_subscription_id: sub_id,
            TenantAccount.current_period_end: end_date,
        },
        synchronize_session="fetch"
    )

    # 5. Record Audit Log
    log_activity(
        db=db,
        user_id=current_user.id,
        action="TENANT_SUBSCRIPTION_ACTIVATED",
        resource_type="tenant_account",
        resource_id=tenant.id,
        details={
            "stripe_customer_id": cust_id,
            "stripe_subscription_id": sub_id,
            "current_period_end": end_date.isoformat()
        }
    )

    db.commit()

    return {
        "status": "success",
        "tenant_id": tenant.id,
        "subscription_status": "ACTIVE",
        "stripe_customer_id": cust_id,
        "stripe_subscription_id": sub_id
    }


@router.post("/tenants/{tenant_identifier}/deactivate-subscription")
def deactivate_subscription(
    tenant_identifier: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("tenants:billing"))
):
    """
    Deactivates a tenant's subscription.
    Requires 'tenants:billing' permission.
    """
    # Fetch Tenant
    if tenant_identifier.isdigit():
        tenant = db.query(TenantAccount).filter(TenantAccount.id == int(tenant_identifier)).first()
    else:
        tenant = db.query(TenantAccount).filter(
            func.lower(TenantAccount.company_name) == tenant_identifier.lower()
        ).first()

    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant '{tenant_identifier}' not found")

    status_to_set = payload.get("status", "PAST_DUE")

    db.query(TenantAccount).filter(TenantAccount.id == tenant.id).update(
        {
            TenantAccount.subscription_status: status_to_set,
        },
        synchronize_session="fetch"
    )

    # Record Audit Log
    log_activity(
        db=db,
        user_id=current_user.id,
        action="TENANT_SUBSCRIPTION_DEACTIVATED",
        resource_type="tenant_account",
        resource_id=tenant.id,
        details={"new_status": status_to_set}
    )

    db.commit()

    return {"status": "success", "tenant_id": tenant.id, "subscription_status": status_to_set}