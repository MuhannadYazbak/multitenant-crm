from database import engine, Base
from sqlalchemy import text
import models  # Ensure models are loaded

# 1. Test query to confirm live host
with engine.connect() as conn:
    res = conn.execute(text("SELECT current_database(), current_user;")).fetchone()
    print(f"Connected successfully to DB: {res[0]} as USER: {res[1]}")

    # 2. Create tenant schemas
    conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_company_a;"))
    conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_company_b;"))
    conn.execute(text("CREATE SCHEMA IF NOT EXISTS tenant_company_c;"))
    conn.commit()

# 3. Create tables across all schemas
Base.metadata.create_all(bind=engine)
print("All tables successfully generated in Supabase!")