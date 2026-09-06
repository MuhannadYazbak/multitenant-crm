# routers/legal.py
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

import models, schemas
from database import get_db_for_tenant
from auth_utils import get_current_user
from rbac import require_permission
from audit import log_activity

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

@router.get(
    "/dashboard/stats",
    dependencies=[Depends(require_permission("legal:read"))]
)
def get_legal_dashboard_stats(db: Session = Depends(get_db_for_tenant)) -> Dict[str, Any]:
    check_legal_tenant(db)

    total_cases = db.query(models.LegalCase).count()

    open_cases = db.query(models.LegalCase).filter(
        models.LegalCase.status.ilike("Open") | models.LegalCase.status.ilike("In Progress")
    ).count()

    type_counts = (
        db.query(models.LegalCase.case_type, func.count(models.LegalCase.id))
        .group_by(models.LegalCase.case_type)
        .all()
    )
    cases_by_type = {case_type: count for case_type, count in type_counts}

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


@router.get(
    "/clients/{client_id}/cases", 
    response_model=List[schemas.LegalCaseResponse],
    dependencies=[Depends(require_permission("legal:read"))]
)
def get_client_cases(client_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    return db.query(models.LegalCase).filter(models.LegalCase.client_id == client_id).all()


@router.post(
    "/cases", 
    response_model=schemas.LegalCaseResponse,
    dependencies=[Depends(require_permission("legal:write"))]
)
def create_case(
    case_data: schemas.LegalCaseCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
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

    log_activity(
        db=db,
        action="LEGAL_CASE_CREATED",
        resource="legal_cases",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"case_id": res_id, "case_number": res_num, "client_id": res_client_id},
        request=request
    )

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


@router.delete(
    "/cases/{case_id}", 
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_permission("legal:delete"))]
)
def delete_case(
    case_id: int, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Soft delete / Archive
    case.status = "Archived"

    log_activity(
        db=db,
        action="LEGAL_CASE_ARCHIVED",
        resource="legal_cases",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"case_id": case_id, "case_number": case.case_number},
        request=request
    )

    db.commit()
    return {"message": "Case archived successfully"}


# ==========================================
# DETAILS, NOTES, DOCS, BILLING
# ==========================================

@router.get(
    "/cases/{case_id}", 
    response_model=schemas.LegalCaseDetailResponse,
    dependencies=[Depends(require_permission("legal:read"))]
)
def get_case_details(case_id: int, db: Session = Depends(get_db_for_tenant)):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post(
    "/cases/{case_id}/notes", 
    response_model=schemas.NoteResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("legal:write"))]
)
def add_case_note(
    case_id: int, 
    payload: schemas.NoteCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)

    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    new_note = models.Note(
        client_id=case.client_id,
        case_id=case.id,
        author_name=payload.author_name or current_user.email,
        note_type=payload.note_type or "General",
        content=payload.content,
        is_pinned=payload.is_pinned or False
    )

    db.add(new_note)
    db.flush()

    log_activity(
        db=db,
        action="CASE_NOTE_CREATED",
        resource="notes",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"note_id": new_note.id, "case_id": case_id},
        request=request
    )

    db.commit()
    db.refresh(new_note)
    return new_note


@router.post(
    "/cases/{case_id}/documents", 
    response_model=schemas.DocumentResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("legal:write"))]
)
def upload_case_document(
    case_id: int,
    request: Request,
    file_category: str = Form("General"),
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
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

    client_exists = db.query(models.Client).filter(models.Client.id == case.client_id).first() if case.client_id else None

    doc = models.Document(
        case_id=case_id,
        client_id=case.client_id if client_exists else None,
        file_name=file.filename,
        file_path=file_path,
        file_category=file_category,
        file_size_bytes=file_size
    )
    db.add(doc)
    db.flush()

    log_activity(
        db=db,
        action="DOCUMENT_UPLOADED",
        resource="documents",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"document_id": doc.id, "case_id": case_id, "file_name": file.filename},
        request=request
    )

    db.commit()
    db.refresh(doc)
    return doc


@router.post(
    "/cases/{case_id}/billing", 
    response_model=schemas.BillingEntryResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("legal:write"))]
)
def add_billing_entry(
    case_id: int, 
    billing_data: schemas.BillingEntryCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    case = db.query(models.LegalCase).filter(models.LegalCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    dumped = billing_data.model_dump(exclude_unset=True) if hasattr(billing_data, "model_dump") else billing_data.dict(exclude_unset=True)

    dumped.pop("client_id", None)
    dumped.pop("case_id", None)

    entry = models.BillingEntry(
        case_id=case_id,
        client_id=case.client_id,
        **dumped
    )
    db.add(entry)
    db.flush()

    log_activity(
        db=db,
        action="BILLING_ENTRY_CREATED",
        resource="billing_entries",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"billing_id": entry.id, "case_id": case_id, "amount": getattr(entry, "amount", None)},
        request=request
    )

    db.commit()
    db.refresh(entry)
    return entry


# --- SUB-RESOURCE DELETE ENDPOINTS ---

@router.delete(
    "/cases/{case_id}/notes/{note_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("legal:delete"))]
)
def delete_case_note(
    case_id: int, 
    note_id: int, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    note = db.query(models.Note).filter(
        models.Note.id == note_id, 
        models.Note.case_id == case_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)

    log_activity(
        db=db,
        action="CASE_NOTE_DELETED",
        resource="notes",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"note_id": note_id, "case_id": case_id},
        request=request
    )

    db.commit()
    return None


@router.delete(
    "/cases/{case_id}/documents/{doc_id}", 
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_permission("legal:delete"))]
)
def archive_case_document(
    case_id: int, 
    doc_id: int, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id, 
        models.Document.case_id == case_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.is_archived = True

    log_activity(
        db=db,
        action="DOCUMENT_ARCHIVED",
        resource="documents",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"doc_id": doc_id, "case_id": case_id, "file_name": doc.file_name},
        request=request
    )

    db.commit()
    return {"message": "Document archived"}


@router.delete(
    "/cases/{case_id}/billing/{billing_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("legal:delete"))]
)
def delete_billing_entry(
    case_id: int, 
    billing_id: int, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)
    entry = db.query(models.BillingEntry).filter(
        models.BillingEntry.id == billing_id, 
        models.BillingEntry.case_id == case_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Billing entry not found")
    
    db.delete(entry)

    log_activity(
        db=db,
        action="BILLING_ENTRY_DELETED",
        resource="billing_entries",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"billing_id": billing_id, "case_id": case_id},
        request=request
    )

    db.commit()
    return None

# -------------------------------------------------------------------
# EVIDENCE ENDPOINTS
# -------------------------------------------------------------------

@router.get(
    "/clients/{client_id}/evidences", 
    response_model=List[schemas.EvidenceResponse],
    dependencies=[Depends(require_permission("legal:read"))]
)
def get_client_evidences(
    client_id: int,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "legal":
        raise HTTPException(status_code=403, detail="Legal module is not enabled for this workspace type")

    return db.query(models.Evidence).filter(models.Evidence.client_id == client_id).all()


@router.post(
    "/clients/{client_id}/evidences", 
    response_model=schemas.EvidenceResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("legal:write"))]
)
def create_evidence(
    client_id: int,
    evidence_data: schemas.EvidenceCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "legal":
        raise HTTPException(status_code=403, detail="Legal module is not enabled for this workspace type")

    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    dumped = evidence_data.model_dump() if hasattr(evidence_data, "model_dump") else evidence_data.dict()
    new_evidence = models.Evidence(client_id=client_id, **dumped)
    
    db.add(new_evidence)
    db.flush()
    
    response_data = schemas.EvidenceResponse.model_validate(new_evidence)

    log_activity(
        db=db,
        action="EVIDENCE_CREATED",
        resource="evidences",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"evidence_id": new_evidence.id, "client_id": client_id},
        request=request
    )

    db.commit()
    return response_data


@router.put(
    "/evidences/{evidence_id}", 
    response_model=schemas.EvidenceResponse,
    dependencies=[Depends(require_permission("legal:write"))]
)
def update_evidence(
    evidence_id: str,
    evidence_update: schemas.EvidenceCreate,
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)

    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    update_data = evidence_update.model_dump(exclude_unset=True) if hasattr(evidence_update, "model_dump") else evidence_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(evidence, key, value)

    log_activity(
        db=db,
        action="EVIDENCE_UPDATED",
        resource="evidences",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"evidence_id": evidence_id, "updated_fields": list(update_data.keys())},
        request=request
    )

    db.commit()
    db.refresh(evidence)
    return evidence


@router.delete(
    "/evidences/{evidence_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("legal:delete"))]
)
def delete_evidence(
    evidence_id: str, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "legal":
        raise HTTPException(status_code=403, detail="Module restricted to legal tenants")

    evidence = db.query(models.Evidence).filter(models.Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    db.delete(evidence)

    log_activity(
        db=db,
        action="EVIDENCE_DELETED",
        resource="evidences",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"evidence_id": evidence_id},
        request=request
    )

    db.commit()
    return None


# -------------------------------------------------------------------
# WITNESS ENDPOINTS
# -------------------------------------------------------------------

@router.get(
    "/clients/{client_id}/witnesses", 
    response_model=List[schemas.WitnessResponse],
    dependencies=[Depends(require_permission("legal:read"))]
)
def get_client_witnesses(
    client_id: int,
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Legal module is not enabled for this workspace type"
        )

    return db.query(models.Witness).filter(models.Witness.client_id == client_id).all()


@router.post(
    "/clients/{client_id}/witnesses", 
    response_model=schemas.WitnessResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("legal:write"))]
)
def create_witness(
    client_id: int,
    witness_data: schemas.WitnessCreate, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Legal module is not enabled for this workspace type"
        )

    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    dumped = witness_data.model_dump() if hasattr(witness_data, "model_dump") else witness_data.dict()
    new_witness = models.Witness(client_id=client_id, **dumped)
    
    db.add(new_witness)
    db.flush()
    
    response_data = schemas.WitnessResponse.model_validate(new_witness)

    log_activity(
        db=db,
        action="WITNESS_CREATED",
        resource="witnesses",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"witness_id": new_witness.id, "client_id": client_id},
        request=request
    )

    db.commit()
    return response_data


@router.put(
    "/witnesses/{witness_id}", 
    response_model=schemas.WitnessResponse,
    dependencies=[Depends(require_permission("legal:write"))]
)
def update_witness(
    witness_id: str,
    witness_update: schemas.WitnessCreate,
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    check_legal_tenant(db)

    witness = db.query(models.Witness).filter(models.Witness.id == witness_id).first()
    if not witness:
        raise HTTPException(status_code=404, detail="Witness not found")

    update_data = witness_update.model_dump(exclude_unset=True) if hasattr(witness_update, "model_dump") else witness_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(witness, key, value)

    log_activity(
        db=db,
        action="WITNESS_UPDATED",
        resource="witnesses",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"witness_id": witness_id, "updated_fields": list(update_data.keys())},
        request=request
    )

    db.commit()
    db.refresh(witness)
    return witness


@router.delete(
    "/witnesses/{witness_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("legal:delete"))]
)
def delete_witness(
    witness_id: str, 
    request: Request,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db_for_tenant)
):
    if db.info.get("tenant_type") != "legal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Module restricted to legal tenants"
        )

    witness = db.query(models.Witness).filter(models.Witness.id == witness_id).first()
    if not witness:
        raise HTTPException(status_code=404, detail="Witness not found")

    db.delete(witness)

    log_activity(
        db=db,
        action="WITNESS_DELETED",
        resource="witnesses",
        user_id=current_user.id,
        user_email=current_user.email,
        details={"witness_id": witness_id},
        request=request
    )

    db.commit()
    return None