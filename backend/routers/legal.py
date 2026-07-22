from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
import models, schemas
from database import get_db_for_tenant

router = APIRouter(
    prefix="/api/legal",
    tags=["Legal Module"]
)

@router.get("/dashboard/stats")
def get_legal_dashboard_stats(db: Session = Depends(get_db_for_tenant)) -> Dict[str, Any]:
    tenant_type = db.info.get("tenant_type", "general")
    if tenant_type != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Legal module stats are disabled for this tenant"
        )

    total_cases = db.query(models.LegalCase).count()

    open_cases = db.query(models.LegalCase).filter(
        models.LegalCase.status.ilike("Open") | models.LegalCase.status.ilike("In Progress")
    ).count()

    # Aggregate count by case_type
    type_counts = (
        db.query(models.LegalCase.case_type, func.count(models.LegalCase.id))
        .group_by(models.LegalCase.case_type)
        .all()
    )
    cases_by_type = {case_type: count for case_type, count in type_counts}

    # Fetch 5 most recent cases joined with client names
    recent_cases_query = (
        db.query(
            models.LegalCase.id,
            models.LegalCase.case_number,
            models.LegalCase.case_type,
            models.LegalCase.status,
            models.LegalCase.client_id,
            models.LegalCase.created_at,
            models.Client.name.label("client_name")
        )
        .join(models.Client, models.LegalCase.client_id == models.Client.id)
        .order_by(models.LegalCase.created_at.desc())
        .limit(5)
        .all()
    )

    recent_cases = [
        {
            "id": c.id,
            "case_number": c.case_number,
            "case_type": c.case_type,
            "status": c.status,
            "client_id": c.client_id,
            "client_name": c.client_name,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in recent_cases_query
    ]

    return {
        "total_cases": total_cases,
        "open_cases": open_cases,
        "closed_cases": max(0, total_cases - open_cases),
        "cases_by_type": cases_by_type,
        "recent_cases": recent_cases
    }

@router.get("/clients/{client_id}/cases", response_model=List[schemas.LegalCaseResponse])
def get_client_cases(client_id: int, db: Session = Depends(get_db_for_tenant)):
    tenant_type = db.info.get("tenant_type", "general")
    if tenant_type != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Legal module is disabled for this tenant"
        )
    
    return db.query(models.LegalCase).filter(models.LegalCase.client_id == client_id).all()

@router.post("/cases", response_model=schemas.LegalCaseResponse)
def create_case(case_data: schemas.LegalCaseCreate, db: Session = Depends(get_db_for_tenant)):
    tenant_type = db.info.get("tenant_type", "general")
    if tenant_type != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Legal module is disabled for this tenant"
        )

    dumped = case_data.model_dump() if hasattr(case_data, "model_dump") else case_data.dict()
    new_case = models.LegalCase(**dumped)
    db.add(new_case)
    db.flush()

    res_id = new_case.id
    res_num = new_case.case_number
    res_type = new_case.case_type
    res_court = new_case.court
    res_status = new_case.status
    res_client_id = new_case.client_id
    res_created_at = new_case.created_at

    db.commit()

    return {
        "id": res_id,
        "case_number": res_num,
        "case_type": res_type,
        "court": res_court,
        "status": res_status,
        "client_id": res_client_id,
        "created_at": res_created_at
    }

@router.delete("/cases/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: int, db: Session = Depends(get_db_for_tenant)):
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(case)
    db.commit()
    return None