import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
import models, schemas
from database import get_db_for_tenant

router = APIRouter(
    prefix="/api/legal",
    tags=["Legal Module"]
)

# Shared guard check helper
def check_legal_tenant(db: Session):
    tenant_type = db.info.get("tenant_type", "general")
    if tenant_type != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Legal module is disabled for this tenant"
        )

UPLOAD_DIR = "uploaded_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- DASHBOARD & EXISTING ENDPOINTS ---

@router.get("/dashboard/stats")
def get_legal_dashboard_stats(db: Session = Depends(get_db_for_tenant)) -> Dict[str, Any]:
    check_legal_tenant(db)

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
    check_legal_tenant(db)
    return db.query(models.LegalCase).filter(models.LegalCase.client_id == client_id).all()


@router.post("/cases", response_model=schemas.LegalCaseResponse)
def create_case(case_data: schemas.LegalCaseCreate, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)

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


@router.delete("/cases/{case_id}", status_code=status.HTTP_200_OK)
def delete_case(case_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Soft delete / Archive
    case.status = "Archived"
    db.commit()
    return {"message": "Case archived successfully"}


# ==========================================
# DETAILS, NOTES, DOCS, BILLING
# ==========================================

@router.get("/cases/{case_id}", response_model=schemas.LegalCaseDetailResponse)
def get_case_details(case_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post("/cases/{case_id}/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def add_case_note(
    case_id: int, 
    payload: schemas.NoteCreate, 
    db: Session = Depends(get_db_for_tenant) # 👈 FIXED: Uses tenant session!
):
    check_legal_tenant(db)

    # 1. Fetch case to ensure client_id context exists
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # 2. Instantiate Note ORM model using models module prefix
    new_note = models.Note(
        client_id=case.client_id,
        case_id=case.id,
        author_name=payload.author_name or "System User",
        note_type=payload.note_type or "General",
        content=payload.content,
        is_pinned=payload.is_pinned or False
    )

    # 3. Add to session, commit, then refresh
    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@router.post("/cases/{case_id}/documents", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_case_document(
    case_id: int,
    file_category: str = Form("General"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    tenant_slug = db.info.get("tenant_slug", "default_tenant")
    tenant_dir = os.path.join(UPLOAD_DIR, tenant_slug, f"case_{case_id}")
    os.makedirs(tenant_dir, exist_ok=True)
    file_path = os.path.join(tenant_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Check if the client actually exists in the clients table
    client_exists = db.query(models.Client).filter(models.Client.id == case.client_id).first() if case.client_id else None

    doc = models.Document(
        case_id=case_id,
        client_id=case.client_id if client_exists else None, # Avoids foreign key violation
        file_name=file.filename,
        file_path=file_path,
        file_category=file_category,
        file_size_bytes=file_size
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.post("/cases/{case_id}/billing", response_model=schemas.BillingEntryResponse, status_code=status.HTTP_201_CREATED)
def add_billing_entry(
    case_id: int, 
    billing_data: schemas.BillingEntryCreate, 
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    dumped = billing_data.model_dump(exclude_unset=True)  # dict() if using Pydantic v1

    # Pop client_id and case_id to prevent duplicate keyword arguments
    dumped.pop("client_id", None)
    dumped.pop("case_id", None)

    entry = models.BillingEntry(
        case_id=case_id,
        client_id=case.client_id,
        **dumped
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# --- SUB-RESOURCE DELETE ENDPOINTS ---

@router.delete("/cases/{case_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case_note(case_id: int, note_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    note = db.query(models.Note).filter(
        models.Note.id == note_id, 
        models.Note.case_id == case_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    return None


@router.delete("/cases/{case_id}/documents/{doc_id}", status_code=status.HTTP_200_OK)
def archive_case_document(case_id: int, doc_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id, 
        models.Document.case_id == case_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.is_archived = True
    db.commit()
    return {"message": "Document archived"}


@router.delete("/cases/{case_id}/billing/{billing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_billing_entry(case_id: int, billing_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    entry = db.query(models.BillingEntry).filter(
        models.BillingEntry.id == billing_id, 
        models.BillingEntry.case_id == case_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Billing entry not found")
    
    db.delete(entry)
    db.commit()
    return None