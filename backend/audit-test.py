from database import SessionLocal
from audit import log_activity

db = SessionLocal()
log_activity(
    db=db,
    action="SYSTEM_INIT",
    resource="system",
    user_email="system@crm.com",
    details={"message": "Audit logging initialized successfully"}
)
db.close()