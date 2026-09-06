# backend/routers/dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db_for_tenant
import models
from models import User
from auth_utils import get_current_user
from rbac import require_permission

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Metrics"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(require_permission("dashboard:read"))
):
    """
    Returns high-level metric summaries tailored to the tenant vertical.
    Requires 'dashboard:read' permission.
    """
    tenant_type = db.info.get("tenant_type", "general")

    # Base metrics for all tenants
    total_clients = (
        db.query(func.count(models.Client.id))
        .filter(models.Client.status == "active")
        .scalar()
        or 0
    )

    stats = {
        "tenant_type": tenant_type,
        "total_clients": total_clients,
        "vertical_stats": {},
    }

    # Vertical-specific metrics: Insurance
    if tenant_type == "insurance":
        policy_stats = db.query(
            func.count(models.InsurancePolicy.id).label("total_policies"),
            func.sum(models.InsurancePolicy.coverage_amount).label(
                "total_coverage"
            ),
        ).first()

        stats["vertical_stats"] = {
            "total_policies": policy_stats.total_policies or 0,
            "total_coverage": float(policy_stats.total_coverage or 0.0),
        }

    # Vertical-specific metrics: Legal
    elif tenant_type == "legal":
        total_cases = (
            db.query(func.count(models.LegalCase.id)).scalar() or 0
        )

        open_cases = (
            db.query(func.count(models.LegalCase.id))
            .filter(
                func.lower(models.LegalCase.status).in_(
                    ["open", "pending", "in progress"]
                )
            )
            .scalar()
            or 0
        )

        stats["vertical_stats"] = {
            "total_cases": total_cases,
            "open_cases": open_cases,
        }

    return stats