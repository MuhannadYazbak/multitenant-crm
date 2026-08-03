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
            
            # ALL tenants get core clients table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS clients (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    address VARCHAR(250),
                    status VARCHAR(50) DEFAULT 'active',
                    custom_fields JSONB DEFAULT '{}'::jsonb NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))

            # Vertical: Insurance
            # Vertical: Insurance
            if tenant_type == "insurance":
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS insurance_policies (
                        id SERIAL PRIMARY KEY,
                        client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                        policy_number VARCHAR(100) NOT NULL,
                        policy_type VARCHAR(100) DEFAULT 'General',
                        coverage_amount NUMERIC(12, 2),
                        deductible NUMERIC(10, 2) DEFAULT 0.00,
                        status VARCHAR(50) DEFAULT 'Active',
                        start_date TIMESTAMP,
                        end_date TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS vehicles (
                        id SERIAL PRIMARY KEY,
                        policy_id INT REFERENCES insurance_policies(id) ON DELETE CASCADE,
                        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                        make VARCHAR(100) NOT NULL,
                        model VARCHAR(100) NOT NULL,
                        year INT NOT NULL,
                        vin VARCHAR(100),
                        license_plate VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS properties (
                        id SERIAL PRIMARY KEY,
                        policy_id INT REFERENCES insurance_policies(id) ON DELETE CASCADE,
                        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                        property_type VARCHAR(100) DEFAULT 'Residential',
                        address VARCHAR(250) NOT NULL,
                        estimated_value NUMERIC(12, 2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

            # Vertical: Legal
            if tenant_type == "legal":
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS legal_cases (
                        id SERIAL PRIMARY KEY,
                        client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                        case_number VARCHAR(100) NOT NULL,
                        case_type VARCHAR(100) NOT NULL,
                        court VARCHAR(255),
                        status VARCHAR(50) DEFAULT 'Open',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS evidences (
                        id SERIAL PRIMARY KEY,
                        case_id INT NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        evidence_type VARCHAR(100),
                        storage_location VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS witnesses (
                        id SERIAL PRIMARY KEY,
                        case_id INT NOT NULL REFERENCES legal_cases(id) ON DELETE CASCADE,
                        full_name VARCHAR(150) NOT NULL,
                        phone VARCHAR(50),
                        email VARCHAR(100),
                        statement TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """))

            # Universal Sub-Resources (All tenants get these with dynamic FKs)
            case_fk = "REFERENCES legal_cases(id) ON DELETE CASCADE" if tenant_type == "legal" else ""
            policy_fk = "REFERENCES insurance_policies(id) ON DELETE CASCADE" if tenant_type == "insurance" else ""

            # Notes
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS notes (
                    id SERIAL PRIMARY KEY,
                    author_name VARCHAR(100) NOT NULL DEFAULT 'System User',
                    note_type VARCHAR(50) DEFAULT 'General',
                    content TEXT NOT NULL,
                    is_pinned BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                    case_id INT {case_fk},
                    policy_id INT {policy_fk}
                );
            """))

            # Documents
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    file_name VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500) NOT NULL,
                    file_type VARCHAR(50),
                    file_category VARCHAR(50) DEFAULT 'General',
                    file_size_bytes BIGINT,
                    is_archived BOOLEAN DEFAULT FALSE,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                    case_id INT {case_fk},
                    policy_id INT {policy_fk}
                );
            """))

            # Billing Entries
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS billing_entries (
                    id SERIAL PRIMARY KEY,
                    description VARCHAR(255) NOT NULL,
                    hours NUMERIC(6, 2),
                    rate NUMERIC(10, 2),
                    total_amount NUMERIC(10, 2) NOT NULL,
                    is_paid BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
                    case_id INT {case_fk},
                    policy_id INT {policy_fk}
                );
            """))

            conn.commit()

    print("Provisioning tenant schemas according to vertical types...")
    provision_tenant_schema("tenant_company_a", "insurance")
    provision_tenant_schema("tenant_company_b", "general")
    provision_tenant_schema("tenant_company_c", "legal")

    # 2. Seed Public Tenant Accounts & Admin
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
    print("Seeding Company A (Insurance)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_a;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Alice Smith', '050-111-2222', 'alice@company-a.com', '123 Main St', 'active', '{}');
            
            INSERT INTO insurance_policies (id, client_id, policy_number, coverage_amount)
            VALUES (1, 1, 'POL-INS-1001', 500000.00);

            INSERT INTO notes (policy_id, author_name, content) 
            VALUES (1, 'System User', 'Policy renewal reminder set.');

            SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT MAX(id) FROM clients));
            SELECT setval(pg_get_serial_sequence('insurance_policies', 'id'), (SELECT MAX(id) FROM insurance_policies));
            SELECT setval(pg_get_serial_sequence('notes', 'id'), (SELECT MAX(id) FROM notes));
            SELECT setval(pg_get_serial_sequence('vehicles', 'id'), COALESCE((SELECT MAX(id) FROM vehicles), 1));
            SELECT setval(pg_get_serial_sequence('properties', 'id'), COALESCE((SELECT MAX(id) FROM properties), 1));
        """))
        conn.commit()

    print("Seeding Company B (General)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_b;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Bob Johnson', '050-333-4444', 'bob@company-b.com', '456 Market St', 'active', '{}');
            
            INSERT INTO notes (client_id, author_name, content) 
            VALUES (1, 'System User', 'General lead follow-up scheduled.');

            INSERT INTO billing_entries (client_id, description, total_amount, is_paid) 
            VALUES (1, 'Consulting Retainer', 500.00, true);

            SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT MAX(id) FROM clients));
            SELECT setval(pg_get_serial_sequence('notes', 'id'), (SELECT MAX(id) FROM notes));
            SELECT setval(pg_get_serial_sequence('billing_entries', 'id'), (SELECT MAX(id) FROM billing_entries));
        """))
        conn.commit()

    print("Seeding Company C (Legal)...")
    with engine.connect() as conn:
        conn.execute(text("SET search_path TO tenant_company_c;"))
        conn.execute(text("""
            INSERT INTO clients (id, name, phone, email, address, status, custom_fields) 
            VALUES (1, 'Charlie Brown', '050-555-6666', 'charlie@company-c.com', '789 Legal Ave', 'active', '{}');
            
            INSERT INTO legal_cases (id, client_id, case_number, case_type, court, status)
            VALUES (1, 1, 'CASE-LEG-3001', 'Civil Litigation', 'District Magistrate Court', 'Open');

            INSERT INTO notes (case_id, author_name, note_type, content, is_pinned) 
            VALUES (1, 'System User', 'General', 'Initial client consultation logged.', false);

            INSERT INTO documents (case_id, file_name, file_path, file_category, file_size_bytes, is_archived) 
            VALUES (1, 'engagement_letter.pdf', '/uploads/engagement_letter.pdf', 'Contract', 1024, false);

            INSERT INTO billing_entries (case_id, description, hours, rate, total_amount, is_paid) 
            VALUES (1, 'Initial consultation fee', 1.5, 166.67, 250.00, false);

            SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT MAX(id) FROM clients));
            SELECT setval(pg_get_serial_sequence('legal_cases', 'id'), (SELECT MAX(id) FROM legal_cases));
            SELECT setval(pg_get_serial_sequence('notes', 'id'), (SELECT MAX(id) FROM notes));
            SELECT setval(pg_get_serial_sequence('documents', 'id'), (SELECT MAX(id) FROM documents));
            SELECT setval(pg_get_serial_sequence('billing_entries', 'id'), (SELECT MAX(id) FROM billing_entries));
            SELECT setval(pg_get_serial_sequence('evidences', 'id'), COALESCE((SELECT MAX(id) FROM evidences), 1));
            SELECT setval(pg_get_serial_sequence('witnesses', 'id'), COALESCE((SELECT MAX(id) FROM witnesses), 1));
        """))
        conn.commit()

    print("\n✅ Success! Database reset and seeded with modular schemas.")
    db.close()


if __name__ == "__main__":
    reset_and_seed()