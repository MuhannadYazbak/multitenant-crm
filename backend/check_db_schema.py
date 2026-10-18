import sys
from sqlalchemy import create_engine, inspect
from database import engine, Base
import models as models

def verify_schema():
    inspector = inspect(engine)
    
    # Fetch tables from default and public schemas
    existing_tables = set(inspector.get_table_names(schema="public")) | set(inspector.get_table_names())

    print("=== DATABASE SCHEMA AUDIT ===")
    
    missing_tables = []
    for model_key, table_obj in Base.metadata.tables.items():
        # Get actual table name without 'public.' prefix if present
        pure_table_name = table_obj.name
        if pure_table_name not in existing_tables:
            missing_tables.append(model_key)

    if missing_tables:
        print(f"\n❌ MISSING TABLES IN DB: {missing_tables}")
    else:
        print("\n✅ All model tables exist in the database.")

    mismatches_found = False

    for model_key, table_obj in Base.metadata.tables.items():
        pure_table_name = table_obj.name
        if pure_table_name not in existing_tables:
            continue
        
        db_columns = {col['name']: col for col in inspector.get_columns(pure_table_name, schema="public")}
        if not db_columns:
            db_columns = {col['name']: col for col in inspector.get_columns(pure_table_name)}

        table_mismatches = []
        for col_name, col_obj in table_obj.columns.items():
            if col_name not in db_columns:
                table_mismatches.append(f"  - Missing column in DB: '{col_name}' ({col_obj.type})")

        if table_mismatches:
            mismatches_found = True
            print(f"\n❌ Table '{pure_table_name}' Column Mismatches:")
            for m in table_mismatches:
                print(m)

    if not mismatches_found and not missing_tables:
        print("\n🎉 Database schema matches SQLAlchemy models perfectly!")

if __name__ == "__main__":
    verify_schema()