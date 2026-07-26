# backend/models.py
import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Boolean, Text
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base

# --- ADMIN MODEL FOR JWT AUTH ---
class Admin(Base):
    __tablename__ = "admins"
    __table_args__ = {"schema": "public"}

    username = Column(String(50), primary_key=True, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- GLOBAL TENANTS (PUBLIC SCHEMA) ---
class TenantAccount(Base):
    __tablename__ = "tenant_accounts"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), unique=True, nullable=False)
    tenant_type = Column(String(50), nullable=False, default="general")
    password_hash = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# --- TENANT CRM CORE ---
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=True)
    status = Column(String, default="active")
    custom_fields = Column(JSONB, default={}, nullable=False)

    # Vertical relationships
    policies = relationship("InsurancePolicy", back_populates="client", cascade="all, delete-orphan")
    legal_cases = relationship("LegalCase", back_populates="client", cascade="all, delete-orphan")

# --- INSURANCE VERTICAL ---
class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    policy_number = Column(String, nullable=False)
    coverage_amount = Column(Numeric(12, 2))

    client = relationship("Client", back_populates="policies")

# --- LEGAL VERTICAL EXTENSIONS ---

class LegalCase(Base):
    __tablename__ = "legal_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, nullable=False, index=True)
    case_type = Column(String, nullable=False)
    court = Column(String, nullable=True)
    status = Column(String, default="Open")
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    client = relationship("Client", back_populates="legal_cases")
    notes = relationship("CaseNote", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("CaseDocument", back_populates="case", cascade="all, delete-orphan")
    billing_entries = relationship("CaseBillingEntry", back_populates="case", cascade="all, delete-orphan")


class CaseNote(Base):
    __tablename__ = "case_notes"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("legal_cases.id", ondelete="CASCADE"), nullable=False)
    author_name = Column(String, nullable=False, default="System User")
    note_type = Column(String, default="General")  # e.g., 'Client Call', 'Court Update', 'Strategy'
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("LegalCase", back_populates="notes")


class CaseDocument(Base):
    __tablename__ = "case_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("legal_cases.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Local storage path or S3 key
    file_category = Column(String, default="General")  # e.g., 'Pleading', 'Evidence', 'Contract'
    file_size_bytes = Column(Integer, nullable=True)
    is_archived = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("LegalCase", back_populates="documents")


class CaseBillingEntry(Base):
    __tablename__ = "case_billing_entries"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("legal_cases.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    hours = Column(Numeric(5, 2), nullable=True)  # e.g. 2.50 hours
    rate = Column(Numeric(10, 2), nullable=True)   # e.g. 150.00 / hour
    total_amount = Column(Numeric(10, 2), nullable=False)  # Hours * Rate or Flat Fee
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("LegalCase", back_populates="billing_entries")