import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, select, text

# 1. Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

LOCAL_DB_URL = "postgresql://postgres:My%40postgre@localhost:5432/saas_mvp"
SUPABASE_DB_URL = os.getenv("DATABASE_URL")

local_engine = create_engine(LOCAL_DB_URL)
supabase_engine = create_engine(SUPABASE_DB_URL)

# Schemas to migrate
schemas_to_migrate = ["public", "tenant_company_a", "tenant_company_b", "tenant_company_c"]

for schema in schemas_to_migrate:
    print(f"\n--- Checking Schema: {schema} ---")
    metadata = MetaData(schema=schema)
    
    try:
        metadata.reflect(bind=local_engine)
    except Exception as e:
        print(f"Skipping schema '{schema}' (not found locally or empty): {e}")
        continue

    with local_engine.connect() as local_conn, supabase_engine.connect() as supabase_conn:
        # Set search path on target for schema-aware inserts
        supabase_conn.execute(text(f'SET search_path TO "{schema}", public'))
        local_conn.execute(text(f'SET search_path TO "{schema}", public'))

        for table_name, table in metadata.tables.items():
            # Clean display name
            short_name = table_name.split(".")[-1]
            rows = local_conn.execute(select(table)).mappings().all()
            
            if rows:
                try:
                    # Clear existing target data in this table to prevent key collisions
                    supabase_conn.execute(text(f'TRUNCATE TABLE "{schema}"."{short_name}" CASCADE;'))
                    supabase_conn.execute(table.insert(), rows)
                    supabase_conn.commit()
                    print(f" Successfully migrated {len(rows)} rows into [{schema}].{short_name}")
                except Exception as insert_err:
                    supabase_conn.rollback()
                    print(f" Error inserting into [{schema}].{short_name}: {insert_err}")
            else:
                print(f" Table [{schema}].{short_name} is empty locally.")

print("\nFull multi-schema data sync complete!")