# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from urllib.parse import unquote
from security import verify_password
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine, Base, get_db_for_tenant, get_db
import models
import schemas  # Clean import from schemas.py
from routers import insurance, dashboard, legal, admin
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import func
from passlib.context import CryptContext
from auth_utils import verify_password
from schemas import TenantLoginRequest
from models import TenantAccount
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Register modular vertical routers
app.include_router(insurance.router)
app.include_router(dashboard.router)
app.include_router(legal.router)
app.include_router(admin.router)

# --- API ENDPOINTS ---

@app.get("/api/clients", response_model=List[schemas.ClientResponse])
def get_tenant_clients(db: Session = Depends(get_db_for_tenant)):
    clients = db.query(models.Client).filter(models.Client.status == 'active').all()
    return clients


@app.post("/api/clients", response_model=schemas.ClientResponse)
def add_tenant_client(client: schemas.ClientCreate, db: Session = Depends(get_db_for_tenant)):
    try:
        client_data = client.model_dump()
        db_client = models.Client(**client_data)
        db.add(db_client)
        db.flush()  # Populates db_client.id before committing

        # Capture response values before commit so we don't need db.refresh()
        res_id = db_client.id
        res_name = db_client.name
        res_phone = db_client.phone
        res_email = db_client.email
        res_address = db_client.address
        res_status = getattr(db_client, "status", "active") or "active"
        res_custom = db_client.custom_fields or {}

        db.commit()

        return {
            "id": res_id,
            "name": res_name,
            "phone": res_phone,
            "email": res_email,
            "address": res_address,
            "status": res_status,
            "custom_fields": res_custom
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/clients/{name}", response_model=schemas.ClientResponse)
def get_tenant_client_detail(name: str, db: Session = Depends(get_db_for_tenant)):
    # Decode twice in case Next.js passed a double-encoded string
    decoded_name = unquote(unquote(name)).lower().strip()
    
    client = db.query(models.Client).filter(text("lower(name) = :name")).params(name=decoded_name).first()
    
    if not client:
        raise HTTPException(status_code=404, detail=f"Client '{decoded_name}' not found")
        
    return client


# @app.post("/api/tenants/login")
# def login_tenant(request: schemas.TenantLoginRequest):
#     safe_tenant = "".join(c for c in request.company_name if c.isalnum() or c in "_-").lower()
    
#     db = SessionLocal()
#     try:
#         account = db.query(models.TenantAccount).filter(
#             models.TenantAccount.company_name == safe_tenant
#         ).first()
        
#         if not account:
#             raise HTTPException(status_code=404, detail="Company workspace does not exist.")
            
#         if not verify_password(request.password, account.password_hash):
#             raise HTTPException(status_code=401, detail="Invalid password.")
            
#         return {"success": True, "tenant": safe_tenant}
#     finally:
#         db.close()

@app.post("/api/tenants/login")
def tenant_login(payload: TenantLoginRequest, db: Session = Depends(get_db)):
    account = db.query(TenantAccount).filter(TenantAccount.company_name == payload.company_name).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Tenant account not found")

    # Status Gate Check
    if account.status == "frozen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This workspace is suspended. Please contact system support."
        )
    elif account.status == "deleted":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tenant account not found"
        )

    if not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "status": "success",
        "company_name": account.company_name,
        "tenant_type": account.tenant_type
    }

@app.get("/api/tenants/{tenant_name}", response_model=schemas.TenantResponse)
def get_tenant_info(tenant_name: str, db: Session = Depends(get_db)): # ✅ FIXED: Uses get_db
    tenant = db.query(models.TenantAccount).filter(models.TenantAccount.company_name == tenant_name).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@app.delete("/api/clients/{client_id}")
def soft_delete_client(client_id: int, db: Session = Depends(get_db_for_tenant)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Soft delete: update status instead of deleting the row
    client.status = "inactive"
    db.commit()
    return {"message": "Client marked as inactive"}


@app.put("/api/clients/{client_id}", response_model=schemas.ClientResponse)
def update_client(
    client_id: int, 
    client_data: schemas.ClientCreate, 
    db: Session = Depends(get_db_for_tenant)
):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    update_dict = client_data.model_dump(exclude_unset=True)
    
    for key, value in update_dict.items():
        if hasattr(db_client, key):
            setattr(db_client, key, value)

    if "custom_fields" in update_dict:
        flag_modified(db_client, "custom_fields")

    # 1. Capture the exact values in local variables BEFORE db.commit()
    res_id = db_client.id
    res_name = db_client.name
    res_phone = db_client.phone
    res_email = db_client.email
    res_address = db_client.address
    res_status = getattr(db_client, "status", "active")
    res_custom = db_client.custom_fields or {}

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")

    # 2. Return from pure Python variables without touching db_client again
    return {
        "id": res_id,
        "name": res_name,
        "phone": res_phone,
        "email": res_email,
        "address": res_address,
        "status": res_status,
        "custom_fields": res_custom
    }

