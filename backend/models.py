# backend/models.py
from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime,Float,
    Numeric, Boolean, Text, BigInteger
)
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base

# --- PUBLIC SCHEMA MODELS ---
class Admin(Base):
    __tablename__ = "admins"
    __table_args__ = {"schema": "public"}

    username = Column(String(50), primary_key=True, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TenantAccount(Base):
    __tablename__ = "tenant_accounts"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(100), unique=True, nullable=False)
    tenant_type = Column(String(50), nullable=False, default="general") # general | insurance | legal
    password_hash = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# --- TENANT CORE ---
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    address = Column(String(250), nullable=True)
    status = Column(String(50), default="active")
    custom_fields = Column(JSONB, default={}, nullable=False)

    # General / Direct Sub-resource Relationships
    notes = relationship("Note", back_populates="client", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="client", cascade="all, delete-orphan")
    billing_entries = relationship("BillingEntry", back_populates="client", cascade="all, delete-orphan")

    # Vertical-specific Relationships (Used conditionally based on tenant_type)
    policies = relationship("InsurancePolicy", back_populates="client", cascade="all, delete-orphan")
    legal_cases = relationship("LegalCase", back_populates="client", cascade="all, delete-orphan")
    vehicles = relationship("Vehicle", back_populates="client", cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="client", cascade="all, delete-orphan")


# --- FLEXIBLE SUB-RESOURCE MODULES ---

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String(100), nullable=False, default="System User")
    note_type = Column(String(50), default="General")
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Flexible FKs: attach to Client directly, OR to Case, OR to Policy
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=True)
    case_id = Column(Integer, ForeignKey("legal_cases.id", ondelete="CASCADE"), nullable=True)
    policy_id = Column(Integer, ForeignKey("insurance_policies.id", ondelete="CASCADE"), nullable=True)

    client = relationship("Client", back_populates="notes")
    case = relationship("LegalCase", back_populates="notes")
    policy = relationship("InsurancePolicy", back_populates="notes")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=True)
    file_category = Column(String(50), default="General")
    file_size_bytes = Column(BigInteger, nullable=True)
    is_archived = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=True)
    case_id = Column(Integer, ForeignKey("legal_cases.id", ondelete="CASCADE"), nullable=True)
    policy_id = Column(Integer, ForeignKey("insurance_policies.id", ondelete="CASCADE"), nullable=True)

    client = relationship("Client", back_populates="documents")
    case = relationship("LegalCase", back_populates="documents")
    policy = relationship("InsurancePolicy", back_populates="documents")


class BillingEntry(Base):
    __tablename__ = "billing_entries"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255), nullable=False)
    hours = Column(Numeric(6, 2), nullable=True)
    rate = Column(Numeric(10, 2), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=True)
    case_id = Column(Integer, ForeignKey("legal_cases.id", ondelete="CASCADE"), nullable=True)
    policy_id = Column(Integer, ForeignKey("insurance_policies.id", ondelete="CASCADE"), nullable=True)

    client = relationship("Client", back_populates="billing_entries")
    case = relationship("LegalCase", back_populates="billing_entries")
    policy = relationship("InsurancePolicy", back_populates="billing_entries")


# --- VERTICAL MODULE: INSURANCE ---

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    policy_number = Column(String(100), nullable=False, index=True)
    policy_type = Column(String(100), default="General")
    coverage_amount = Column(Numeric(12, 2), nullable=True)
    deductible = Column(Numeric(10, 2), default=0.00)
    status = Column(String(50), default="Active")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="policies")
    notes = relationship("Note", back_populates="policy", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="policy", cascade="all, delete-orphan")
    billing_entries = relationship("BillingEntry", back_populates="policy", cascade="all, delete-orphan")
    
class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    
    manufacturer = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    plate_no = Column(String(8), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to Client
    client = relationship("Client", back_populates="vehicles")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    
    property_type = Column(String(100), nullable=False)  # e.g. "Residential", "Commercial", "Apartment"
    area = Column(Float, nullable=False)                 # Area in sq meters / sq feet
    address = Column(String(255), nullable=True)        # Optional address field if needed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to Client
    client = relationship("Client", back_populates="properties")


# --- VERTICAL MODULE: LEGAL ---

class LegalCase(Base):
    __tablename__ = "legal_cases"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    case_number = Column(String(100), nullable=False, index=True)
    case_type = Column(String(100), nullable=False)
    court = Column(String(255), nullable=True)
    status = Column(String(50), default="Open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="legal_cases")
    notes = relationship("Note", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    billing_entries = relationship("BillingEntry", back_populates="case", cascade="all, delete-orphan")