# backend/routers/internal.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, text
from database import get_db, engine
from models import TenantAccount

# 1. Define the router instance FIRST
router = APIRouter(prefix="/api/internal", tags=["Internal"])

# 2. Now use @router.post(...)
# backend/routers/internal.py
from datetime import datetime, timezone, timedelta

# backend/routers/internal.py

@router.post("/tenants/{tenant_identifier}/activate-subscription")
def activate_subscription(
    tenant_identifier: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    # 1. Fetch Tenant
    if tenant_identifier.isdigit():
        tenant = db.query(TenantAccount).filter(TenantAccount.id == int(tenant_identifier)).first()
    else:
        tenant = db.query(TenantAccount).filter(
            func.lower(TenantAccount.company_name) == tenant_identifier.lower()
        ).first()

    if not tenant:
        raise HTTPException(status_code=404, detail=f"Tenant '{tenant_identifier}' not found")

    # 2. Extract keys flexibly (handles both 'customer' and 'customer_id')
    cust_id = payload.get("customer_id") or payload.get("customer")
    sub_id = payload.get("subscription_id") or payload.get("subscription")

    # 3. Handle Period End safely
    period_end = payload.get("period_end")
    if period_end and isinstance(period_end, (int, float)):
        end_date = datetime.fromtimestamp(period_end, tz=timezone.utc)
    else:
        end_date = datetime.now(timezone.utc) + timedelta(days=30)

    # 4. Perform Direct Bulk UPDATE Query (Bypasses ORM dirty-check gotchas)
    db.query(TenantAccount).filter(TenantAccount.id == tenant.id).update(
        {
            TenantAccount.subscription_status: "ACTIVE",
            TenantAccount.stripe_customer_id: cust_id,
            TenantAccount.stripe_subscription_id: sub_id,
            TenantAccount.current_period_end: end_date,
        },
        synchronize_session="fetch"
    )

    db.commit()

    return {
        "status": "success",
        "tenant_id": tenant.id,
        "subscription_status": "ACTIVE",
        "stripe_customer_id": cust_id,
        "stripe_subscription_id": sub_id
    }

# backend/routers/internal.py

@router.post("/tenants/{tenant_identifier}/deactivate-subscription")
def deactivate_subscription(
    tenant_identifier: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    # Fetch Tenant
    tenant = db.query(TenantAccount).filter(
        (TenantAccount.id == int(tenant_identifier)) if tenant_identifier.isdigit()
        else (func.lower(TenantAccount.company_name) == tenant_identifier.lower())
    ).first()

    if not tenant:
        raise HTTPException(status_code=404, detail=f"Tenant '{tenant_identifier}' not found")

    # Mark subscription as PAST_DUE or INACTIVE
    status_to_set = payload.get("status", "PAST_DUE")

    db.query(TenantAccount).filter(TenantAccount.id == tenant.id).update(
        {
            TenantAccount.subscription_status: status_to_set,
        },
        synchronize_session="fetch"
    )

    db.commit()

    return {"status": "success", "tenant_id": tenant.id, "subscription_status": status_to_set}