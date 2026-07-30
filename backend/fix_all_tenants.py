# backend/fix_all_tenants.py
from database import engine
from sqlalchemy import text

def patch_all_schemas():
    statements = [
        "ALTER TABLE notes ADD COLUMN IF NOT EXISTS case_id INTEGER NULL;",
        "ALTER TABLE notes ADD COLUMN IF NOT EXISTS policy_id INTEGER NULL;",
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS case_id INTEGER NULL;",
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS policy_id INTEGER NULL;",
        "ALTER TABLE billing_entries ADD COLUMN IF NOT EXISTS case_id INTEGER NULL;",
        "ALTER TABLE billing_entries ADD COLUMN IF NOT EXISTS policy_id INTEGER NULL;",
    ]

    with engine.begin() as conn:
        # 1. First, patch the 'public' schema
        print("🔧 Patching schema: public")
        conn.execute(text("SET search_path TO public;"))
        for stmt in statements:
            conn.execute(text(stmt))

        # 2. Find ONLY tenant schemas that actually contain a 'notes' table
        schema_query = text("""
            SELECT table_schema 
            FROM information_schema.tables 
            WHERE table_name = 'notes' 
              AND table_schema NOT IN ('public', 'pg_catalog', 'information_schema');
        """)
        schemas = conn.execute(schema_query).fetchall()

        # 3. Patch each tenant schema individually
        for (schema_name,) in schemas:
            print(f"🔧 Patching tenant schema: {schema_name}")
            conn.execute(text(f'SET search_path TO "{schema_name}";'))
            for stmt in statements:
                conn.execute(text(stmt))

        # 4. Reset search path back to default
        conn.execute(text("SET search_path TO public;"))

    print("\n✅ All tenant schemas successfully updated!")

if __name__ == "__main__":
    patch_all_schemas()