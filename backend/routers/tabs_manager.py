# tabs_manager.py
import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db_for_tenant
from models import User
from auth_utils import get_current_user
from rbac import require_permission
from audit import log_activity

router = APIRouter(
    prefix="/api/tabs",
    tags=["Tabs Manager"]
)

UPLOAD_DIR = "uploaded_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def resolve_entity_context(entity_type: str, entity_id: int, db: Session):
    """Validates existence of parent entity and extracts entity hierarchy."""
    entity_type = entity_type.lower()
    context = {"client_id": None, "case_id": None, "policy_id": None}

    if entity_type == "client":
        client = db.query(models.Client).filter(models.Client.id == entity_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        context["client_id"] = client.id

    elif entity_type in ["legal_case", "case"]:
        case = db.query(models.LegalCase).filter(models.LegalCase.id == entity_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="Legal Case not found")
        context["client_id"] = case.client_id
        context["case_id"] = case.id

    elif entity_type in ["insurance_policy", "policy"]:
        policy = db.query(models.InsurancePolicy).filter(models.InsurancePolicy.id == entity_id).first()
        if not policy:
            raise HTTPException(status_code=404, detail="Insurance Policy not found")
        context["client_id"] = policy.client_id
        context["policy_id"] = policy.id

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported entity type: '{entity_type}'.")

    return context


# ==========================================
# 1. NOTES TAB
# ==========================================

@router.get(
    "/{entity_type}/{entity_id}/notes", 
    response_model=List[schemas.NoteResponse],
    dependencies=[Depends(require_permission("notes:read"))]
)
def get_entity_notes(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    resolve_entity_context(entity_type, entity_id, db)
    query = db.query(models.Note)

    if entity_type == "client":
        query = query.filter(models.Note.client_id == entity_id)
    elif entity_type in ["legal_case", "case"]:
        query = query.filter(models.Note.case_id == entity_id)
    elif entity_type in ["insurance_policy", "policy"]:
        query = query.filter(models.Note.policy_id == entity_id)

    return query.order_by(models.Note.is_pinned.desc(), models.Note.created_at.desc()).all()



@router.post(
    "/{entity_type}/{entity_id}/notes", 
    response_model=schemas.NoteResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("notes:write"))]
)
def create_entity_note(
    entity_type: str,
    entity_id: int,
    payload: schemas.NoteCreate,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    ctx = resolve_entity_context(entity_type, entity_id, db)

    note_kwargs = {
        "client_id": ctx["client_id"],
        "case_id": ctx["case_id"],
        "policy_id": ctx["policy_id"],
        "author_name": payload.author_name or getattr(current_user, "email", "System User"),
        "note_type": payload.note_type or "General",
        "content": payload.content,
        "is_pinned": payload.is_pinned or False
    }

    filtered_kwargs = {k: v for k, v in note_kwargs.items() if v is not None}

    new_note = models.Note(**filtered_kwargs)
    db.add(new_note)
    db.flush()

    n_id = str(new_note.id)
    n_client_id = new_note.client_id
    n_case_id = new_note.case_id
    n_policy_id = new_note.policy_id
    n_author = new_note.author_name
    n_content = new_note.content
    n_type = new_note.note_type
    n_pinned = new_note.is_pinned
    n_created_at = new_note.created_at

    log_activity(
        db=db,
        action="NOTE_CREATED",
        resource="notes",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"note_id": n_id, "entity_type": entity_type, "entity_id": entity_id},
        request=request
    )

    db.commit()
    return {
        "id": n_id,
        "client_id": n_client_id,
        "case_id": n_case_id,
        "policy_id": n_policy_id,
        "author_name": n_author,
        "content": n_content,
        "note_type": n_type,
        "is_pinned": n_pinned,
        "created_at": n_created_at
    }

from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

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
    check_insurance_tenant(db)

    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    dumped = vehicle_data.model_dump() if hasattr(vehicle_data, "model_dump") else vehicle_data.dict()
    new_vehicle = models.Vehicle(client_id=client_id, **dumped)
    
    try:
        db.add(new_vehicle)
        db.flush()
        
        log_activity(
            db=db,
            action="VEHICLE_CREATED",
            resource="vehicles",
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            user_email=current_user.email,
            details={"vehicle_id": new_vehicle.id, "plate_no": getattr(new_vehicle, "plate_no", None), "client_id": client_id},
            request=request
        )

        db.commit()

        # Return a plain dictionary so FastAPI never touches the closed session
        return {
            "id": new_vehicle.id,
            "client_id": new_vehicle.client_id,
            "manufacturer": getattr(new_vehicle, "manufacturer", None),
            "model": new_vehicle.model,
            "year": new_vehicle.year,
            "plate_no": getattr(new_vehicle, "plate_no", None),
            "created_at": new_vehicle.created_at
        }
        
    except Exception as e:
        db.rollback()
        raw_err = repr(e.orig) if hasattr(e, "orig") else str(e)
        print(f"DATABASE COMMIT FAILURE IN CREATE VEHICLE: {raw_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vehicle creation failed: {raw_err}"
        )


@router.delete(
    "/{entity_type}/{entity_id}/notes/{note_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("notes:delete"))]
)
def delete_entity_note(
    entity_type: str,
    entity_id: int,
    note_id: int,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    resolve_entity_context(entity_type, entity_id, db)
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)

    log_activity(
        db=db,
        action="NOTE_DELETED",
        resource="notes",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"note_id": note_id, "entity_type": entity_type, "entity_id": entity_id},
        request=request
    )

    db.commit()
    return None


# ==========================================
# 2. DOCUMENTS TAB
# ==========================================

@router.get(
    "/{entity_type}/{entity_id}/documents", 
    response_model=List[schemas.DocumentResponse],
    dependencies=[Depends(require_permission("documents:read"))]
)
def get_entity_documents(
    entity_type: str,
    entity_id: int,
    show_archived: bool = False,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    resolve_entity_context(entity_type, entity_id, db)
    query = db.query(models.Document).filter(models.Document.is_archived == show_archived)

    if entity_type == "client":
        query = query.filter(models.Document.client_id == entity_id)
    elif entity_type in ["legal_case", "case"]:
        query = query.filter(models.Document.case_id == entity_id)
    elif entity_type in ["insurance_policy", "policy"]:
        query = query.filter(models.Document.policy_id == entity_id)

    return query.order_by(models.Document.uploaded_at.desc()).all()


@router.post(
    "/{entity_type}/{entity_id}/documents", 
    response_model=schemas.DocumentResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("documents:write"))]
)
def upload_entity_document(
    entity_type: str,
    entity_id: int,
    request: Request,
    file_category: str = Form("General"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    ctx = resolve_entity_context(entity_type, entity_id, db)
    tenant_slug = db.info.get("tenant_slug", "default_tenant")
    tenant_dir = os.path.join(UPLOAD_DIR, tenant_slug, f"{entity_type}_{entity_id}")
    os.makedirs(tenant_dir, exist_ok=True)
    file_path = os.path.join(tenant_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    doc_kwargs = {
        "client_id": ctx["client_id"],
        "case_id": ctx["case_id"],
        "policy_id": ctx["policy_id"],
        "file_name": file.filename,
        "file_path": file_path,
        "file_category": file_category,
        "file_size_bytes": file_size
    }

    filtered_kwargs = {k: v for k, v in doc_kwargs.items() if v is not None}

    doc = models.Document(**filtered_kwargs)
    db.add(doc)
    db.flush()

    d_id = doc.id
    d_client_id = doc.client_id
    d_case_id = doc.case_id
    d_policy_id = doc.policy_id
    d_file_name = doc.file_name
    d_file_path = doc.file_path
    d_file_category = doc.file_category
    d_file_size = doc.file_size_bytes
    d_is_archived = getattr(doc, "is_archived", False)
    d_uploaded_at = doc.uploaded_at

    log_activity(
        db=db,
        action="DOCUMENT_UPLOADED",
        resource="documents",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"doc_id": d_id, "file_name": d_file_name, "file_category": d_file_category},
        request=request
    )

    db.commit()
    return {
        "id": d_id,
        "client_id": d_client_id,
        "case_id": d_case_id,
        "policy_id": d_policy_id,
        "file_name": d_file_name,
        "file_path": d_file_path,
        "file_category": d_file_category,
        "file_size_bytes": d_file_size,
        "is_archived": d_is_archived,
        "uploaded_at": d_uploaded_at
    }



@router.put(
    "/{entity_type}/{entity_id}/documents/{document_id}/archive", 
    response_model=schemas.DocumentResponse,
    dependencies=[Depends(require_permission("documents:write"))]
)
def archive_entity_document(
    entity_type: str,
    entity_id: int,
    document_id: int,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    resolve_entity_context(entity_type, entity_id, db)
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.is_archived = True
    db.flush()

    d_id = doc.id
    d_client_id = doc.client_id
    d_case_id = doc.case_id
    d_policy_id = doc.policy_id
    d_file_name = doc.file_name
    d_file_path = doc.file_path
    d_file_category = doc.file_category
    d_file_size = doc.file_size_bytes
    d_is_archived = doc.is_archived
    d_uploaded_at = doc.uploaded_at

    log_activity(
        db=db,
        action="DOCUMENT_ARCHIVED",
        resource="documents",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"document_id": document_id, "file_name": d_file_name},
        request=request
    )

    db.commit()
    return {
        "id": d_id,
        "client_id": d_client_id,
        "case_id": d_case_id,
        "policy_id": d_policy_id,
        "file_name": d_file_name,
        "file_path": d_file_path,
        "file_category": d_file_category,
        "file_size_bytes": d_file_size,
        "is_archived": d_is_archived,
        "uploaded_at": d_uploaded_at
    }

# ==========================================
# 3. BILLING TAB
# ==========================================

@router.get(
    "/{entity_type}/{entity_id}/billing", 
    response_model=List[schemas.BillingEntryResponse],
    dependencies=[Depends(require_permission("billing:read"))]
)
def get_entity_billing_entries(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    resolve_entity_context(entity_type, entity_id, db)
    query = db.query(models.BillingEntry)

    if entity_type == "client":
        query = query.filter(models.BillingEntry.client_id == entity_id)
    elif entity_type in ["legal_case", "case"]:
        query = query.filter(models.BillingEntry.case_id == entity_id)
    elif entity_type in ["insurance_policy", "policy"]:
        query = query.filter(models.BillingEntry.policy_id == entity_id)

    return query.order_by(models.BillingEntry.created_at.desc()).all()


@router.post(
    "/{entity_type}/{entity_id}/billing", 
    response_model=schemas.BillingEntryResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("billing:write"))]
)
def create_entity_billing_entry(
    entity_type: str,
    entity_id: int,
    billing_data: schemas.BillingEntryCreate,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    context = resolve_entity_context(entity_type, entity_id, db)

    dumped = billing_data.model_dump(exclude_unset=True) if hasattr(billing_data, "model_dump") else billing_data.dict()
    dumped.pop("client_id", None)
    dumped.pop("case_id", None)
    dumped.pop("policy_id", None)

    billing_kwargs = {
        "client_id": context["client_id"],
        "case_id": context["case_id"],
        "policy_id": context["policy_id"],
        **dumped
    }

    filtered_kwargs = {k: v for k, v in billing_kwargs.items() if v is not None}

    entry = models.BillingEntry(**filtered_kwargs)
    db.add(entry)
    db.flush()

    b_id = entry.id
    b_client_id = entry.client_id
    b_case_id = entry.case_id
    b_policy_id = entry.policy_id
    b_description = getattr(entry, "description", None)
    b_amount = getattr(entry, "total_amount", 0.0)
    b_status = getattr(entry, "status", None)
    b_created_at = entry.created_at

    log_activity(
        db=db,
        action="BILLING_ENTRY_CREATED",
        resource="billing_entries",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"billing_id": b_id, "total_amount": float(b_amount)},
        request=request
    )

    db.commit()
    return {
        "id": b_id,
        "client_id": b_client_id,
        "case_id": b_case_id,
        "policy_id": b_policy_id,
        "description": b_description,
        "total_amount": b_amount,
        "status": b_status,
        "created_at": b_created_at
    }


@router.delete(
    "/{entity_type}/{entity_id}/billing/{billing_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("billing:delete"))]
)
def delete_entity_billing_entry(
    entity_type: str,
    entity_id: int,
    billing_id: int,
    request: Request,
    db: Session = Depends(get_db_for_tenant),
    current_user: User = Depends(get_current_user)
):
    resolve_entity_context(entity_type, entity_id, db)
    entry = db.query(models.BillingEntry).filter(models.BillingEntry.id == billing_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Billing entry not found")

    db.delete(entry)

    log_activity(
        db=db,
        action="BILLING_ENTRY_DELETED",
        resource="billing_entries",
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        user_email=current_user.email,
        details={"billing_id": billing_id, "entity_type": entity_type, "entity_id": entity_id},
        request=request
    )

    db.commit()
    return None