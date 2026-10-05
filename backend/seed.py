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
import re
from sqlalchemy import text
from database import engine, Base


def reset_and_seed():
    data_path = os.path.join(os.path.dirname(__file__), "supabase_data.sql")

    if not os.path.exists(data_path):
        print(f"❌ Could not find {data_path}")
        return

    with engine.connect() as conn:
        # 1. Reset schema clean
        print("🧹 Resetting schema...")
        conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()

    # 2. Re-create all tables defined in your SQLAlchemy models
    print("🏗️ Creating database tables from SQLAlchemy Base metadata...")
    Base.metadata.create_all(bind=engine)

    # 3. Read and clean the SQL dump file
    print(f"📖 Reading {data_path}...")
    with open(data_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Filter out psql meta-commands (lines starting with '\') and SQL comments
    clean_lines = []
    for line in lines:
        stripped = line.strip()
        # Skip psql meta-commands (like \set, \connect, \unrestrict)
        if stripped.startswith("\\"):
            continue
        clean_lines.append(line)

    clean_sql = "".join(clean_lines)

    # 4. Execute data seeding
    if clean_sql.strip():
        print("⚡ Executing SQL seed data...")
        with engine.connect() as conn:
            # Execute in transaction context
            conn.execute(text(clean_sql))
            conn.commit()
        print("✅ Database successfully created and seeded!")
    else:
        print("⚠️️ No valid SQL statements found after cleaning.")


if __name__ == "__main__":
    reset_and_seed()