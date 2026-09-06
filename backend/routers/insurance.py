# routers/insurance.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db_for_tenant
from auth_utils import get_current_user
from rbac import require_permission
from audit import log_activity

router = APIRouter(
    prefix="/api/insurance",
    tags=["Insurance Module"]
)

# -------------------------------------------------------------------
# POLICY ENDPOINTS
# -------------------------------------------------------------------

@router.post(
    "/policies", 
    response_model=schemas.InsurancePolicyResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("insurance:write"))]
)
def create_policy(
    policy_data: schemas.InsurancePolicyCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insurance module is not enabled for this workspace type"
        )

    client = db.query(models.Client).filter(models.Client.id == policy_data.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    dumped = policy_data.model_dump() if hasattr(policy_data, "model_dump") else policy_data.dict()
    new_policy = models.InsurancePolicy(**dumped)
    
    db.add(new_policy)
    db.flush()
    
    response_data = schemas.InsurancePolicyResponse.model_validate(new_policy)
    
    log_activity(
        db=db,
        action="INSURANCE_POLICY_CREATED",
        resource="insurance_policies",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"policy_id": new_policy.id, "policy_number": new_policy.policy_number, "client_id": client.id},
        request=request
    )
    
    db.commit()
    return response_data


@router.get(
    "/clients/{client_id}/policies", 
    response_model=List[schemas.InsurancePolicyResponse],
    dependencies=[Depends(require_permission("insurance:read"))]
)
def get_client_policies(
    client_id: int, 
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Module restricted to insurance tenants")

    return db.query(models.InsurancePolicy).filter(models.InsurancePolicy.client_id == client_id).all()


@router.delete(
    "/policies/{policy_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("insurance:delete"))]
)
def delete_policy(
    policy_id: int, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Module restricted to insurance tenants")

    policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    policy_number = policy.policy_number
    db.delete(policy)
    
    log_activity(
        db=db,
        action="INSURANCE_POLICY_DELETED",
        resource="insurance_policies",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"policy_id": policy_id, "policy_number": policy_number},
        request=request
    )

    db.commit()
    return None

# -------------------------------------------------------------------
# VEHICLE ENDPOINTS
# -------------------------------------------------------------------

@router.get(
    "/clients/{client_id}/vehicles", 
    response_model=List[schemas.VehicleResponse],
    dependencies=[Depends(require_permission("insurance:read"))]
)
def get_client_vehicles(
    client_id: int,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Insurance module is not enabled for this workspace type")

    return db.query(models.Vehicle).filter(models.Vehicle.client_id == client_id).all()


@router.post(
    "/clients/{client_id}/vehicles", 
    response_model=schemas.VehicleResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("insurance:write"))]
)
def create_vehicle(
    client_id: int,
    vehicle_data: schemas.VehicleCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Insurance module is not enabled for this workspace type")

    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    dumped = vehicle_data.model_dump() if hasattr(vehicle_data, "model_dump") else vehicle_data.dict()
    new_vehicle = models.Vehicle(client_id=client_id, **dumped)
    
    db.add(new_vehicle)
    db.flush()
    
    response_data = schemas.VehicleResponse.model_validate(new_vehicle)
    
    log_activity(
        db=db,
        action="VEHICLE_CREATED",
        resource="vehicles",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"vehicle_id": new_vehicle.id, "plate_no": new_vehicle.plate_no, "client_id": client_id},
        request=request
    )

    db.commit()
    return response_data


@router.put(
    "/vehicles/{vehicle_id}", 
    response_model=schemas.VehicleResponse,
    dependencies=[Depends(require_permission("insurance:write"))]
)
def update_vehicle(
    vehicle_id: str,
    vehicle_update: schemas.VehicleCreate,
    request: Request,
    current_user: models.User = Depends(get_current_user),
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
    
    log_activity(
        db=db,
        action="VEHICLE_UPDATED",
        resource="vehicles",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"vehicle_id": vehicle_id, "updated_fields": list(update_data.keys())},
        request=request
    )

    db.commit()
    return response_data


@router.delete(
    "/vehicles/{vehicle_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("insurance:delete"))]
)
def delete_vehicle(
    vehicle_id: str, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(status_code=403, detail="Module restricted to insurance tenants")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db.delete(vehicle)
    
    log_activity(
        db=db,
        action="VEHICLE_DELETED",
        resource="vehicles",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"vehicle_id": vehicle_id},
        request=request
    )

    db.commit()
    return None

# -------------------------------------------------------------------
# PROPERTY ENDPOINTS
# -------------------------------------------------------------------

@router.get(
    "/clients/{client_id}/properties", 
    response_model=List[schemas.PropertyResponse],
    dependencies=[Depends(require_permission("insurance:read"))]
)
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


@router.post(
    "/clients/{client_id}/properties", 
    response_model=schemas.PropertyResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("insurance:write"))]
)
def create_property(
    client_id: int,
    property_data: schemas.PropertyCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "insurance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insurance module is not enabled for this workspace type"
        )

    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    dumped = property_data.model_dump() if hasattr(property_data, "model_dump") else property_data.dict()
    new_property = models.Property(client_id=client_id, **dumped)
    
    db.add(new_property)
    db.flush()
    
    response_data = schemas.PropertyResponse.model_validate(new_property)
    
    log_activity(
        db=db,
        action="PROPERTY_CREATED",
        resource="properties",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"property_id": new_property.id, "client_id": client_id},
        request=request
    )

    db.commit()
    return response_data


@router.put(
    "/properties/{property_id}", 
    response_model=schemas.PropertyResponse,
    dependencies=[Depends(require_permission("insurance:write"))]
)
def update_property(
    property_id: str,
    property_update: schemas.PropertyCreate,
    request: Request,
    current_user: models.User = Depends(get_current_user),
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
    
    log_activity(
        db=db,
        action="PROPERTY_UPDATED",
        resource="properties",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"property_id": property_id, "updated_fields": list(update_data.keys())},
        request=request
    )

    db.commit()
    return response_data


@router.delete(
    "/properties/{property_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("insurance:delete"))]
)
def delete_property(
    property_id: str, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
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
    
    log_activity(
        db=db,
        action="PROPERTY_DELETED",
        resource="properties",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"property_id": property_id},
        request=request
    )

    db.commit()
    return None