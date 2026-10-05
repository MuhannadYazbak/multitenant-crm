import os
from database import engine
from sqlalchemy import text

def reset_and_seed():
    print("Resetting database schema...")
    with engine.connect() as conn:
        # 1. Clear existing schema
        conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()

        # 2. Execute SQL file while filtering out psql meta-commands (like \unrestrict or \set)
        data_path = os.path.join(os.path.dirname(__file__), "supabase_data.sql")
        # Or "supabase_schema.sql" depending on your filename
        
        if os.path.exists(data_path):
            print(f"Reading {data_path}...")
            with open(data_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Filter out lines starting with '\' (psql meta-commands)
            clean_sql = "\n".join(
                [line for line in lines if not line.strip().startswith("\\")]
            )

            print("Executing SQL dump...")
            conn.execute(text(clean_sql))
            conn.commit()
            print("✅ Database successfully seeded!")
        else:
            print(f"❌ Could not find {data_path}")

if __name__ == "__main__":
    reset_and_seed()