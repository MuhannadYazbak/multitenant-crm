from database import engine, text
init_auth_schema = """
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.schema_migrations (
    version VARCHAR(255) PRIMARY KEY
);
"""

with engine.connect() as conn:
    conn.execute(text(init_auth_schema))
    conn.execute(text(clean_sql))
    conn.commit()