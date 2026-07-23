# backend/models.py
import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, func
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

# --- LEGAL VERTICAL ---
class LegalCase(Base):
    __tablename__ = "legal_cases"

    # FIXED: removed primary_order=True
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, nullable=False, index=True)
    case_type = Column(String, nullable=False)
    court = Column(String, nullable=True)
    status = Column(String, default="Open")
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    client = relationship("Client", back_populates="legal_cases")