# seed.py
from database import engine, SessionLocal, Base
import models
from sqlalchemy import text

def reset_and_seed():
    print("Dropping existing tenant schemas and resetting database...")
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA IF EXISTS tenant_company_a CASCADE;"))
        conn.execute(text("DROP SCHEMA IF EXISTS tenant_company_b CASCADE;"))
        conn.execute(text("DROP SCHEMA IF EXISTS tenant_company_c CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS public.tenant_accounts CASCADE;"))
        
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_company_a;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_company_b;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_company_c;"))
        conn.commit()

    print("Creating public tenant tables...")
    Base.metadata.create_all(bind=engine)

    # 1. Provision Tables Strictly by Tenant Type
    def provision_tenant_schema(schema_name: str, tenant_type: str):
        with engine.connect() as conn:
            conn.execute(text(f"SET search_path TO {schema_name};"))
            
            # ALL tenants get the core clients table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS clients (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    address VARCHAR(250),
                    status VARCHAR(50) DEFAULT 'active',
                    custom_fields JSONB DEFAULT '{}'::jsonb NOT NULL
                );
            """))

            # Insurance-specific tables
            if tenant_type in ["insurance", "general"]:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS insurance_policies (
                        id SERIAL PRIMARY KEY,
                        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                        policy_number VARCHAR(100) NOT NULL,
                        coverage_amount NUMERIC(12, 2)
                    );
                """))

            # Legal-specific tables
            if tenant_type in ["legal", "general"]:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS legal_cases (
                        id SERIAL PRIMARY KEY,
                        case_number VARCHAR(100) NOT NULL,
                        case_type VARCHAR(100) NOT NULL,
                        court VARCHAR(255),
                        status VARCHAR(50) DEFAULT 'Open',
                        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))
            conn.commit()

    print("Provisioning tenant schemas according to vertical types...")
    provision_tenant_schema("tenant_company_a", "insurance")
    provision_tenant_schema("tenant_company_b", "general")
    provision_tenant_schema("tenant_company_c", "legal")

    # 2. Seed Public Tenant Accounts using YOUR working Bcrypt Hashes
    db = SessionLocal()

    # Shared Bcrypt hash from your working SQL log
    WORKING_HASH = "$2b$12$GZuausL2gNRph9SndjHBKOh.eGqyAkIxrbDK9L6RAtFrzAHtC6bUy"

    tenants = [
        models.TenantAccount(company_name="company-a", password_hash=WORKING_HASH, tenant_type="insurance"),
        models.TenantAccount(company_name="company-b", password_hash=WORKING_HASH, tenant_type="general"),
        models.TenantAccount(company_name="company-c", password_hash=WORKING_HASH, tenant_type="legal"),
    ]
    db.add_all(tenants)
    db.commit()
    
    # Seed Admin User for Admin Lifecycle Tests
    admin_user = db.query(models.Admin).filter_by(username="admin").first()
    if not admin_user:
        # Uses the same working bcrypt hash or a hashed version of 'admin123'
        admin = models.Admin(username="admin", password_hash=WORKING_HASH)
        db.add(admin)

    db.commit()

    # 3. Seed Mock Data Tailored to Each Schema
    print("Seeding Company A (Insurance only)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_a;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Alice Smith', '050-111-2222', 'alice@company-a.com', '123 Main St', 'active', '{}');
            
            INSERT INTO insurance_policies (client_id, policy_number, coverage_amount)
            VALUES (1, 'POL-INS-1001', 500000.00);
        """))
        conn.commit()

    print("Seeding Company B (General - Insurance & Legal)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_b;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Bob Johnson', '050-333-4444', 'bob@company-b.com', '456 Market St', 'active', '{}');
            
            INSERT INTO insurance_policies (client_id, policy_number, coverage_amount)
            VALUES (1, 'POL-GEN-2002', 250000.00);
            
            INSERT INTO legal_cases (client_id, case_number, case_type, court, status)
            VALUES (1, 'CASE-GEN-200', 'Contract Review', 'Arbitration', 'Open');
        """))
        conn.commit()

    print("Seeding Company C (Legal only)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_c;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Charlie Brown', '050-555-6666', 'charlie@company-c.com', '789 Legal Ave', 'active', '{}');
            
            INSERT INTO legal_cases (client_id, case_number, case_type, court, status)
            VALUES (1, 'CASE-LEG-3001', 'Civil Litigation', 'District Magistrate Court', 'Open');
        """))
        conn.commit()

    print("\n✅ Success! Database reset, logins restored, and schema tables created strictly by tenant type.")
    db.close()


if __name__ == "__main__":
    reset_and_seed()