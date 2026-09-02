import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, select

# 1. Load environment variables explicitly
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# 2. Connection Strings
LOCAL_DB_URL = "postgresql://postgres:My%40postgre@localhost:5432/saas_mvp"
SUPABASE_DB_URL = os.getenv("DATABASE_URL")

if not SUPABASE_DB_URL:
    raise ValueError("DATABASE_URL could not be found in .env file!")

local_engine = create_engine(LOCAL_DB_URL)
supabase_engine = create_engine(SUPABASE_DB_URL)

# 3. Reflect Local Schema & Copy Data
metadata = MetaData()
metadata.reflect(bind=local_engine)

with local_engine.connect() as local_conn, supabase_engine.connect() as supabase_conn:
    for table_name, table in metadata.tables.items():
        rows = local_conn.execute(select(table)).mappings().all()
        
        if rows:
            supabase_conn.execute(table.insert(), rows)
            supabase_conn.commit()
            print(f"Migrated {len(rows)} rows into '{table_name}'")

print("Data migration complete!")