from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db_for_tenant  # Your tenant database dependency

router = APIRouter(
    prefix="/api/insurance",
    tags=["Insurance Module"]
)

# routers/insurance.py

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

    dumped = policy_data.model_dump() if hasattr(policy_data, "model_dump") else policy_data.dict()
    new_policy = models.InsurancePolicy(**dumped)
    
    db.add(new_policy)
    db.flush()  # Populates auto-generated ID & defaults in-memory
    
    # Safely convert to Pydantic before session commit
    response_data = schemas.InsurancePolicyResponse.model_validate(new_policy)
    db.commit()
    
    return response_data


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

# -------------------------------------------------------------------
# VEHICLE ENDPOINTS
# -------------------------------------------------------------------

@router.get("/clients/{client_id}/vehicles", response_model=List[schemas.VehicleResponse])
def get_client_vehicles(
    client_id: int,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Insurance module is not enabled for this workspace type")

    return db.query(models.Vehicle).filter(models.Vehicle.client_id == client_id).all()


@router.post("/clients/{client_id}/vehicles", response_model=schemas.VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    client_id: int,
    vehicle_data: schemas.VehicleCreate, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Insurance module is not enabled for this workspace type")

    # 1. Verify client exists within this tenant
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # 2. Instantiate vehicle with client_id from path
    dumped = vehicle_data.model_dump() if hasattr(vehicle_data, "model_dump") else vehicle_data.dict()
    new_vehicle = models.Vehicle(client_id=client_id, **dumped)
    
    db.add(new_vehicle)
    db.flush()
    
    response_data = schemas.VehicleResponse.model_validate(new_vehicle)
    db.commit()
    return response_data


@router.put("/vehicles/{vehicle_id}", response_model=schemas.VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    vehicle_update: schemas.VehicleCreate,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Insurance module is not enabled for this workspace type")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = vehicle_update.model_dump(exclude_unset=True) if hasattr(vehicle_update, "model_dump") else vehicle_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vehicle, key, value)

    db.flush()
    response_data = schemas.VehicleResponse.model_validate(vehicle)
    db.commit()
    return response_data


@router.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: str, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Module restricted to insurance tenants")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db.delete(vehicle)
    db.commit()
    return None


# -------------------------------------------------------------------
# PROPERTY ENDPOINTS
# -------------------------------------------------------------------

@router.get("/clients/{client_id}/properties", response_model=List[schemas.PropertyResponse])
def get_client_properties(
    client_id: int,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insurance module is not enabled for this workspace type"
        )

    return db.query(models.Property).filter(models.Property.client_id == client_id).all()


@router.post("/clients/{client_id}/properties", response_model=schemas.PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    client_id: int,
    property_data: schemas.PropertyCreate, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insurance module is not enabled for this workspace type"
        )

    # 1. Verify client exists within this tenant
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # 2. Instantiate property with client_id passed in URL path
    dumped = property_data.model_dump() if hasattr(property_data, "model_dump") else property_data.dict()
    new_property = models.Property(client_id=client_id, **dumped)
    
    db.add(new_property)
    db.flush()  # Generates UUID & defaults in-memory
    
    response_data = schemas.PropertyResponse.model_validate(new_property)
    db.commit()
    return response_data


@router.put("/properties/{property_id}", response_model=schemas.PropertyResponse)
def update_property(
    property_id: str,
    property_update: schemas.PropertyCreate,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insurance module is not enabled for this workspace type"
        )

    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    update_data = property_update.model_dump(exclude_unset=True) if hasattr(property_update, "model_dump") else property_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prop, key, value)

    db.flush()
    response_data = schemas.PropertyResponse.model_validate(prop)
    db.commit()
    return response_data


@router.delete("/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: str, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Module restricted to insurance tenants"
        )

    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    db.delete(prop)
    db.commit()
    return None