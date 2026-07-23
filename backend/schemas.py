from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Literal, Optional, Dict, Any, List
from decimal import Decimal
from datetime import datetime
import re

# ==========================================
# CORE CRM SCHEMAS
# ==========================================

class ClientBase(BaseModel):
    # Name: at least 2 chars, letters and spaces only
    name: str = Field(
        ..., 
        min_length=2, 
        max_length=100, 
        pattern=r"^[A-Za-z\s'-]+$",
        examples=["John Doe"]
    )
    
    # Phone: allows spaces, dashes, and parens with 7 to 15 digits
    phone: str = Field(
        ..., 
        pattern=r"^\+?[\d\s\-()]{7,20}$",
        examples=["+1234567890", "0501234567", "050-123-4567"]
    )
    
    # Email: automatically checks RFC standard formatting
    email: EmailStr
    
    # Address: Optional so it doesn't break if left empty or short
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
    pass  # Used when POSTing a new client

class ClientResponse(ClientBase):
    id: int

    class Config:
        from_attributes = True  # Allows Pydantic to read SQLAlchemy ORM models directly

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


# Admin Auth Schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ==========================================
# INSURANCE VERTICAL SCHEMAS
# ==========================================

class InsurancePolicyBase(BaseModel):
    policy_number: str
    coverage_amount: Decimal
    client_id: int

class InsurancePolicyCreate(InsurancePolicyBase):
    pass  # Used when creating a policy in routers/insurance.py

class InsurancePolicyResponse(InsurancePolicyBase):
    id: int

    class Config:
        from_attributes = True

# ==========================================
# LEGAL VERTICAL SCHEMAS
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

    class Config:
        from_attributes = True