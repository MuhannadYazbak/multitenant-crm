from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db_for_tenant  # Your tenant database dependency

router = APIRouter(
    prefix="/api/insurance",
    tags=["Insurance Module"]
)

@router.post("/policies", response_model=schemas.InsurancePolicyResponse, status_code=status.HTTP_201_CREATED)
def create_policy(
    policy_data: schemas.InsurancePolicyCreate, 
    db: Session = Depends(get_db_for_tenant)
):
    # Verify tenant vertical
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insurance module is not enabled for this workspace type"
        )

    # Verify client exists within this tenant
    client = db.query(models.Client).filter(models.Client.id == policy_data.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    new_policy = models.InsurancePolicy(**policy_data.model_dump())
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    return new_policy


@router.get("/clients/{client_id}/policies", response_model=List[schemas.InsurancePolicyResponse])
def get_client_policies(
    client_id: int, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Module restricted to insurance tenants")

    policies = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.client_id == client_id).all()
    return policies


@router.delete("/policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_policy(
    policy_id: int, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Module restricted to insurance tenants")

    policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    db.delete(policy)
    db.commit()
    return None