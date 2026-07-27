# backend/schemas.py
import re
from decimal import Decimal
from datetime import datetime
from typing import Literal, Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

# ==========================================
# 1. TENANT SCHEMAS
# ==========================================

class TenantCreate(BaseModel):
    company_name: str
    password: str
    tenant_type: Literal["general", "insurance", "legal"] = "general"

class TenantLoginRequest(BaseModel):
    company_name: str
    password: str

class TenantStatusUpdate(BaseModel):
    # Restrict status options to allowed values
    status: Literal["active", "frozen", "deleted"]

class TenantResponse(BaseModel):
    id: int
    company_name: str
    tenant_type: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. ADMIN AUTH SCHEMAS
# ==========================================

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ==========================================
# 3. CORE CLIENT SCHEMAS
# ==========================================

class ClientBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=2, 
        max_length=100, 
        pattern=r"^[A-Za-z\s'-]+$",
        examples=["John Doe"]
    )
    phone: str = Field(
        ..., 
        pattern=r"^\+?[\d\s\-()]{7,20}$",
        examples=["+1234567890", "0501234567", "050-123-4567"]
    )
    email: EmailStr
    address: Optional[str] = Field(
        default=None, 
        max_length=250,
        examples=["123 Main St, Apt 4B"]
    )
    status: Optional[str] = "active"
    custom_fields: Optional[Dict[str, Any]] = {}

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty or whitespace only")
        return v.title()

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. UNIFIED SUB-RESOURCE SCHEMAS
# ==========================================

# --- NOTES ---
class NoteBase(BaseModel):
    content: str
    note_type: Optional[str] = "General"
    is_pinned: Optional[bool] = False

class NoteCreate(NoteBase):
    author_name: Optional[str] = "System User"
    client_id: Optional[int] = None
    case_id: Optional[int] = None
    policy_id: Optional[int] = None

class NoteResponse(NoteBase):
    id: int
    author_name: str
    client_id: Optional[int] = None
    case_id: Optional[int] = None
    policy_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- DOCUMENTS ---
class DocumentBase(BaseModel):
    file_category: Optional[str] = "General"
    file_type: Optional[str] = None
    is_archived: Optional[bool] = False

class DocumentCreate(DocumentBase):
    file_name: str
    file_path: str
    file_size_bytes: Optional[int] = None
    client_id: Optional[int] = None
    case_id: Optional[int] = None
    policy_id: Optional[int] = None

class DocumentResponse(DocumentBase):
    id: int
    file_name: str
    file_path: str
    file_size_bytes: Optional[int] = None
    client_id: Optional[int] = None
    case_id: Optional[int] = None
    policy_id: Optional[int] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- BILLING ENTRIES ---
class BillingEntryBase(BaseModel):
    description: str
    hours: Optional[Decimal] = None
    rate: Optional[Decimal] = None
    total_amount: Decimal
    is_paid: Optional[bool] = False

class BillingEntryCreate(BillingEntryBase):
    client_id: Optional[int] = None
    case_id: Optional[int] = None
    policy_id: Optional[int] = None

class BillingEntryResponse(BillingEntryBase):
    id: int
    client_id: Optional[int] = None
    case_id: Optional[int] = None
    policy_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- GENERAL CLIENT DETAIL RESPONSE ---
class ClientDetailResponse(ClientResponse):
    notes: List[NoteResponse] = []
    documents: List[DocumentResponse] = []
    billing_entries: List[BillingEntryResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 5. INSURANCE VERTICAL SCHEMAS
# ==========================================

class InsurancePolicyBase(BaseModel):
    policy_number: str
    policy_type: Optional[str] = "General"
    coverage_amount: Optional[Decimal] = None
    deductible: Optional[Decimal] = Decimal("0.00")
    status: Optional[str] = "Active"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class InsurancePolicyCreate(InsurancePolicyBase):
    client_id: int

class InsurancePolicyResponse(InsurancePolicyBase):
    id: int
    client_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InsurancePolicyDetailResponse(InsurancePolicyResponse):
    notes: List[NoteResponse] = []
    documents: List[DocumentResponse] = []
    billing_entries: List[BillingEntryResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 6. LEGAL VERTICAL SCHEMAS
# ==========================================

class LegalCaseBase(BaseModel):
    case_number: str
    case_type: str
    court: Optional[str] = None
    status: Optional[str] = "Open"

class LegalCaseCreate(LegalCaseBase):
    client_id: int

class LegalCaseResponse(LegalCaseBase):
    id: int
    client_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LegalCaseDetailResponse(LegalCaseResponse):
    notes: List[NoteResponse] = []
    documents: List[DocumentResponse] = []
    billing_entries: List[BillingEntryResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 7. BACKWARD COMPATIBILITY ALIASES
# (Prevents breakage if legacy code imports old names)
# ==========================================

CaseNoteCreate = NoteCreate
CaseNoteResponse = NoteResponse
CaseDocumentCreate = DocumentCreate
CaseDocumentResponse = DocumentResponse
CaseBillingCreate = BillingEntryCreate
CaseBillingResponse = BillingEntryResponse