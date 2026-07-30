import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db_for_tenant

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

@router.get("/{entity_type}/{entity_id}/notes", response_model=List[schemas.NoteResponse])
def get_entity_notes(entity_type: str, entity_id: int, db: Session = Depends(get_db_for_tenant)):
    resolve_entity_context(entity_type, entity_id, db)
    query = db.query(models.Note)

    if entity_type == "client":
        query = query.filter(models.Note.client_id == entity_id)
    elif entity_type in ["legal_case", "case"]:
        query = query.filter(models.Note.case_id == entity_id)
    elif entity_type in ["insurance_policy", "policy"]:
        query = query.filter(models.Note.policy_id == entity_id)

    return query.order_by(models.Note.is_pinned.desc(), models.Note.created_at.desc()).all()


@router.post("/{entity_type}/{entity_id}/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_entity_note(entity_type: str, entity_id: int, payload: schemas.NoteCreate, db: Session = Depends(get_db_for_tenant)):
    ctx = resolve_entity_context(entity_type, entity_id, db)

    note_kwargs = {
        "client_id": ctx["client_id"],
        "case_id": ctx["case_id"],
        "policy_id": ctx["policy_id"],
        "author_name": payload.author_name or "System User",
        "note_type": payload.note_type or "General",
        "content": payload.content,
        "is_pinned": payload.is_pinned or False
    }

    filtered_kwargs = {k: v for k, v in note_kwargs.items() if v is not None}

    new_note = models.Note(**filtered_kwargs)
    db.add(new_note)
    db.flush()  # Populate ID & created_at timestamp
    
    # Load pydantic data into memory before committing session
    response_data = schemas.NoteResponse.model_validate(new_note)
    db.commit()
    return response_data


@router.delete("/{entity_type}/{entity_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity_note(entity_type: str, entity_id: int, note_id: int, db: Session = Depends(get_db_for_tenant)):
    resolve_entity_context(entity_type, entity_id, db)
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None


# ==========================================
# 2. DOCUMENTS TAB
# ==========================================

@router.get("/{entity_type}/{entity_id}/documents", response_model=List[schemas.DocumentResponse])
def get_entity_documents(entity_type: str, entity_id: int, show_archived: bool = False, db: Session = Depends(get_db_for_tenant)):
    resolve_entity_context(entity_type, entity_id, db)
    query = db.query(models.Document).filter(models.Document.is_archived == show_archived)

    if entity_type == "client":
        query = query.filter(models.Document.client_id == entity_id)
    elif entity_type in ["legal_case", "case"]:
        query = query.filter(models.Document.case_id == entity_id)
    elif entity_type in ["insurance_policy", "policy"]:
        query = query.filter(models.Document.policy_id == entity_id)

    return query.order_by(models.Document.uploaded_at.desc()).all()


@router.post("/{entity_type}/{entity_id}/documents", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_entity_document(
    entity_type: str,
    entity_id: int,
    file_category: str = Form("General"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db_for_tenant)
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
    db.flush()  # Populate ID and uploaded_at timestamp
    
    # Load pydantic data into memory before committing session
    response_data = schemas.DocumentResponse.model_validate(doc)
    db.commit()
    return response_data


@router.put("/{entity_type}/{entity_id}/documents/{document_id}/archive", response_model=schemas.DocumentResponse)
def archive_entity_document(entity_type: str, entity_id: int, document_id: int, db: Session = Depends(get_db_for_tenant)):
    resolve_entity_context(entity_type, entity_id, db)
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.is_archived = True
    db.flush()
    response_data = schemas.DocumentResponse.model_validate(doc)
    db.commit()
    return response_data


# ==========================================
# 3. BILLING TAB
# ==========================================

@router.get("/{entity_type}/{entity_id}/billing", response_model=List[schemas.BillingEntryResponse])
def get_entity_billing_entries(entity_type: str, entity_id: int, db: Session = Depends(get_db_for_tenant)):
    resolve_entity_context(entity_type, entity_id, db)
    query = db.query(models.BillingEntry)

    if entity_type == "client":
        query = query.filter(models.BillingEntry.client_id == entity_id)
    elif entity_type in ["legal_case", "case"]:
        query = query.filter(models.BillingEntry.case_id == entity_id)
    elif entity_type in ["insurance_policy", "policy"]:
        query = query.filter(models.BillingEntry.policy_id == entity_id)

    return query.order_by(models.BillingEntry.created_at.desc()).all()


@router.post("/{entity_type}/{entity_id}/billing", response_model=schemas.BillingEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entity_billing_entry(entity_type: str, entity_id: int, billing_data: schemas.BillingEntryCreate, db: Session = Depends(get_db_for_tenant)):
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
    
    response_data = schemas.BillingEntryResponse.model_validate(entry)
    db.commit()
    return response_data


@router.delete("/{entity_type}/{entity_id}/billing/{billing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity_billing_entry(entity_type: str, entity_id: int, billing_id: int, db: Session = Depends(get_db_for_tenant)):
    resolve_entity_context(entity_type, entity_id, db)
    entry = db.query(models.BillingEntry).filter(models.BillingEntry.id == billing_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Billing entry not found")

    db.delete(entry)
    db.commit()
    return None