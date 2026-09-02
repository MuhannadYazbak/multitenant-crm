from database import engine, Base
from sqlalchemy import text
import models  # Ensure all models are imported

tenant_schemas = ["tenant_company_a", "tenant_company_b", "tenant_company_c"]

with engine.connect() as conn:
    for schema in tenant_schemas:
        # Switch search path so create_all target changes schema
        conn.execute(text(f'SET search_path TO "{schema}"'))
        Base.metadata.create_all(bind=conn)
        print(f"Created all tenant tables in {schema}")
    
    conn.execute(text("RESET search_path"))
    conn.commit()