# backend/routers/dashboard.py
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db_for_tenant
import models
from models import User
from auth_utils import get_current_user
from rbac import require_permission

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Metrics"])


class VerticalStats(BaseModel):
    # Insurance metrics
    total_policies: Optional[int] = None
    total_coverage: Optional[float] = None
    
    # Legal metrics
    total_cases: Optional[int] = None
    open_cases: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class DashboardStatsResponse(BaseModel):
    tenant_type: str
    total_clients: int
    vertical_stats: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    dependencies=[Depends(require_permission("dashboard:read"))]
)
def get_dashboard_stats(
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    """
    Returns high-level metric summaries tailored to the tenant vertical.
    Requires 'dashboard:read' permission.
    """
    tenant_type = db.info.get("tenant_type", "general")

    # Base metrics available across all tenant verticals
    total_clients = (
        db.query(func.count(models.Client.id))
        .filter(models.Client.status == "active")
        .scalar()
        or 0
    )

    vertical_stats: Dict[str, Any] = {}

    # Vertical-specific metrics: Insurance
    if tenant_type == "insurance":
        policy_stats = db.query(
            func.count(models.InsurancePolicy.id).label("total_policies"),
            func.coalesce(func.sum(models.InsurancePolicy.coverage_amount), 0.0).label("total_coverage"),
        ).first()

        vertical_stats = {
            "total_policies": policy_stats.total_policies if policy_stats else 0,
            "total_coverage": float(policy_stats.total_coverage) if policy_stats else 0.0,
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

        vertical_stats = {
            "total_cases": total_cases,
            "open_cases": open_cases,
        }

    return DashboardStatsResponse(
        tenant_type=tenant_type,
        total_clients=total_clients,
        vertical_stats=vertical_stats,
    )