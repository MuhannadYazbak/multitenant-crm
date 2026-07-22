from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from database import get_db_for_tenant

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard Metrics"]
)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db_for_tenant)):
    tenant_type = db.info.get("tenant_type", "general")
    
    # Base metrics for all tenants
    total_clients = db.query(func.count(models.Client.id)).filter(
        models.Client.status == "active"
    ).scalar() or 0

    stats = {
        "tenant_type": tenant_type,
        "total_clients": total_clients,
        "vertical_stats": {}
    }

    # Vertical-specific metrics
    if tenant_type == "insurance":
        policy_stats = db.query(
            func.count(models.InsurancePolicy.id).label("total_policies"),
            func.sum(models.InsurancePolicy.coverage_amount).label("total_coverage")
        ).first()

        stats["vertical_stats"] = {
            "total_policies": policy_stats.total_policies or 0,
            "total_coverage": float(policy_stats.total_coverage or 0.0)
        }

    return stats