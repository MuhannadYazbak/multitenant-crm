# backend/fix_tenant_db.py
from database import engine
from sqlalchemy import text

def patch_missing_columns():
    statements = [
        "ALTER TABLE notes ADD COLUMN IF NOT EXISTS case_id INTEGER NULL;",
        "ALTER TABLE notes ADD COLUMN IF NOT EXISTS policy_id INTEGER NULL;",
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS case_id INTEGER NULL;",
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS policy_id INTEGER NULL;",
        "ALTER TABLE billing_entries ADD COLUMN IF NOT EXISTS case_id INTEGER NULL;",
        "ALTER TABLE billing_entries ADD COLUMN IF NOT EXISTS policy_id INTEGER NULL;",
    ]

    print("🔧 Adding missing vertical columns to database...")
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
            print(f"  Executed: {stmt}")
    print("✅ Database schema successfully patched!")

if __name__ == "__main__":
    patch_missing_columns()