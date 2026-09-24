# fix_sequence.py
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));"))
    conn.commit()
    print("Successfully reset users_id_seq sequence!")