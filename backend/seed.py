# import os
# from database import engine, Base
# from sqlalchemy import text

# def reset_and_seed():
#     Base.metadata.create_all(bind=engine)
#     print("Resetting database schema...")
#     with engine.connect() as conn:
#         # 1. Clear existing schema
#         conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
#         conn.execute(text("CREATE SCHEMA public;"))
#         conn.commit()

#         # 2. Execute SQL file while filtering out psql meta-commands (like \unrestrict or \set)
#         data_path = os.path.join(os.path.dirname(__file__), "supabase_data.sql")
#         # Or "supabase_schema.sql" depending on your filename
        
#         if os.path.exists(data_path):
#             print(f"Reading {data_path}...")
#             with open(data_path, "r", encoding="utf-8") as f:
#                 lines = f.readlines()

#             # Filter out lines starting with '\' (psql meta-commands)
#             clean_sql = "\n".join(
#                 [line for line in lines if not line.strip().startswith("\\")]
#             )

#             print("Executing SQL dump...")
#             conn.execute(text(clean_sql))
#             conn.commit()
#             print("✅ Database successfully seeded!")
#         else:
#             print(f"❌ Could not find {data_path}")

# if __name__ == "__main__":
#     reset_and_seed()


import os
import sqlparse
from sqlalchemy import text
from database import engine, Base

def reset_and_seed():
    # 🛑 GUARD 1: Prevent running on Supabase / Cloud URLs
    DB_URL = str(engine.url)
    print(f"Connecting to database host: {engine.url.host}:{engine.url.port}/{engine.url.database}")
    
    if "supabase.co" in DB_URL or "pooler.supabase.com" in DB_URL:
        raise RuntimeError("🚨 SAFETY BLOCK TRIGGERED: Refusing to run reset_and_seed on a Supabase database!")

    # 🛑 GUARD 2: Explicit Environment Check
    env = os.getenv("ENV", "development").lower()
    if env not in ["development", "test", "local"]:
        raise RuntimeError(f"🚨 SAFETY BLOCK TRIGGERED: ENV must be 'development', 'test', or 'local' (currently '{env}').")

    data_path = os.path.join(os.path.dirname(__file__), "supabase_data.sql")
    if not os.path.exists(data_path):
        print(f"❌ Could not find {data_path}")
        return

    print("🏗️ Ensuring database tables exist from SQLAlchemy Base metadata...")
    Base.metadata.create_all(bind=engine)

    print("🧹 Truncating existing tables for a clean seed state...")
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Disable triggers/FKs temporarily while truncating
            conn.execute(text("SET session_replication_role = 'replica';"))
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;'))
            conn.execute(text("SET session_replication_role = 'origin';"))
            trans.commit()
            print("✨ Tables truncated successfully.")
        except Exception as e:
            trans.rollback()
            print(f"⚠️ Truncate skipped or encountered error: {e}")

    print(f"📖 Reading and parsing {data_path}...")
    with open(data_path, "r", encoding="utf-8") as f:
        content = f.read()

    parsed_statements = sqlparse.split(content)

    print("⚡ Executing seed statements...")
    inserted_count = 0
    error_count = 0

    with engine.connect() as conn:
        try:
            conn.execute(text("SET session_replication_role = 'replica';"))
            conn.commit()
        except Exception:
            pass

        for stmt in parsed_statements:
            stmt_clean = sqlparse.format(stmt, strip_comments=True).strip()
            
            if not stmt_clean or stmt_clean.startswith("\\"):
                continue

            trans = conn.begin_nested()
            try:
                conn.execute(text(stmt_clean))
                trans.commit()
                inserted_count += 1
            except Exception as e:
                trans.rollback()
                error_count += 1
                if error_count <= 5:
                    print(f"⚠️ Statement skipped due to error: {e}")

        try:
            conn.execute(text("SET session_replication_role = 'origin';"))
            conn.commit()
        except Exception:
            pass

    print(f"\n✅ Seeding complete! Successfully ran {inserted_count} statements ({error_count} skipped/errored).")

if __name__ == "__main__":
    reset_and_seed()