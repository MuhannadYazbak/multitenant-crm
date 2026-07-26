# seed.py
from database import engine, SessionLocal, Base
import models
from sqlalchemy import text
from auth_utils import hash_password

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
            
            # ALL tenants get core clients table with soft-delete support
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS clients (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    address VARCHAR(250),
                    status VARCHAR(50) DEFAULT 'active',
                    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
                    archived_at TIMESTAMP,
                    custom_fields JSONB DEFAULT '{}'::jsonb NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Insurance-specific tables
            if tenant_type in ["insurance", "general"]:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS insurance_policies (
                        id SERIAL PRIMARY KEY,
                        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                        policy_number VARCHAR(100) NOT NULL,
                        coverage_amount NUMERIC(12, 2),
                        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
                        archived_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

            # Legal-specific tables & sub-resources
            if tenant_type in ["legal", "general"]:
                # Legal Cases
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS legal_cases (
                        id SERIAL PRIMARY KEY,
                        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                        case_number VARCHAR(100) NOT NULL,
                        case_type VARCHAR(100) NOT NULL,
                        court VARCHAR(255),
                        status VARCHAR(50) DEFAULT 'Open',
                        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
                        archived_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

                # Legal Case Notes
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS case_notes (
                        id SERIAL PRIMARY KEY,
                        case_id INT REFERENCES legal_cases(id) ON DELETE CASCADE,
                        author_name VARCHAR(100) NOT NULL,
                        content TEXT NOT NULL,
                        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
                        archived_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

                # Legal Case Documents
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS case_documents (
                        id SERIAL PRIMARY KEY,
                        case_id INT REFERENCES legal_cases(id) ON DELETE CASCADE,
                        file_name VARCHAR(255) NOT NULL,
                        file_path VARCHAR(500) NOT NULL,
                        category VARCHAR(100) DEFAULT 'General',
                        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
                        archived_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

                # Legal Case Billing Entries
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS case_billing (
                        id SERIAL PRIMARY KEY,
                        case_id INT REFERENCES legal_cases(id) ON DELETE CASCADE,
                        description VARCHAR(255) NOT NULL,
                        amount NUMERIC(10, 2) NOT NULL,
                        hours_spent NUMERIC(5, 2) DEFAULT 0.0,
                        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
                        archived_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

            conn.commit()

    print("Provisioning tenant schemas according to vertical types...")
    provision_tenant_schema("tenant_company_a", "insurance")
    provision_tenant_schema("tenant_company_b", "general")
    provision_tenant_schema("tenant_company_c", "legal")

    # 2. Seed Public Tenant Accounts
    db = SessionLocal()

    ADMIN_HASH = hash_password("admin123")
    TENANT_HASH = hash_password("supersecret123")

    admin_user = db.query(models.Admin).filter_by(username="admin").first()
    if not admin_user:
        admin = models.Admin(username="admin", password_hash=ADMIN_HASH)
        db.add(admin)

    tenants = [
        models.TenantAccount(company_name="company-a", password_hash=TENANT_HASH, tenant_type="insurance"),
        models.TenantAccount(company_name="company-b", password_hash=TENANT_HASH, tenant_type="general"),
        models.TenantAccount(company_name="company-c", password_hash=TENANT_HASH, tenant_type="legal"),
    ]
    db.add_all(tenants)
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

            SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT MAX(id) FROM clients));
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
            
            INSERT INTO legal_cases (id, client_id, case_number, case_type, court, status)
            VALUES (1, 1, 'CASE-GEN-200', 'Contract Review', 'Arbitration', 'Open');

            INSERT INTO case_notes (case_id, content) VALUES (1, 'Initial contract review completed.');

            SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT MAX(id) FROM clients));
            SELECT setval(pg_get_serial_sequence('legal_cases', 'id'), (SELECT MAX(id) FROM legal_cases));
        """))
        conn.commit()

    print("Seeding Company C (Legal only)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_c;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Charlie Brown', '050-555-6666', 'charlie@company-c.com', '789 Legal Ave', 'active', '{}');
            
            INSERT INTO legal_cases (id, client_id, case_number, case_type, court, status)
            VALUES (1, 1, 'CASE-LEG-3001', 'Civil Litigation', 'District Magistrate Court', 'Open');

            INSERT INTO case_notes (case_id, content) VALUES (1, 'Initial client consultation logged.');
            INSERT INTO case_documents (case_id, file_name, file_path, category) VALUES (1, 'engagement_letter.pdf', '/uploads/engagement_letter.pdf', 'Contract');
            INSERT INTO case_billing (case_id, description, amount, hours_spent) VALUES (1, 'Initial consultation fee', 250.00, 1.5);

            SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT MAX(id) FROM clients));
            SELECT setval(pg_get_serial_sequence('legal_cases', 'id'), (SELECT MAX(id) FROM legal_cases));
        """))
        conn.commit()

    print("\n✅ Success! Database reset, soft-deletes enabled, and all legal sub-resource tables created.")
    db.close()


if __name__ == "__main__":
    reset_and_seed()