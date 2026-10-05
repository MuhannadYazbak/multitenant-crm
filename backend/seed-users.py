import os
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Role, UserRole, TenantAccount
from auth_utils import hash_password  # Ensure name matches auth_utils.py

def seed_data():
    db: Session = SessionLocal()
    try:
        # 1. Fetch or create a default tenant
        tenant = db.query(TenantAccount).first()
        if not tenant:
            tenant = TenantAccount(name="Default Tenant", tenant_type="insurance")
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            print(f"Created default tenant (ID: {tenant.id})")

        # 2. Define standard permissions list for Super Admin
        admin_permissions = [
            "insurance:read", "insurance:write", "insurance:delete",
            "legal:read", "legal:write", "legal:delete",
            "admin:read", "admin:write",
            "clients:read", "clients:write", "clients:delete"
        ]

        # 3. Create or fetch Admin Role
        admin_role = db.query(Role).filter_by(name="Admin").first()
        if not admin_role:
            admin_role = Role(
                name="Admin",
                permissions=admin_permissions
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
            print("Created Admin role.")
        else:
            print("Admin role already exists.")

        # 4. Create or fetch Admin User
        admin_email = "admin@example.com"
        admin_user = db.query(User).filter_by(email=admin_email).first()
        if not admin_user:
            hashed_pw = hash_password("Admin123456!")
            
            admin_user = User(
                email=admin_email,
                password_hash=hashed_pw,
                full_name = "Admin User",
                is_active=True,
                tenant_id=tenant.id
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"Created admin user: {admin_email}")
        else:
            print(f"Admin user {admin_email} already exists.")

        # 5. Link Admin User to Admin Role via UserRole
        user_role_link = db.query(UserRole).filter_by(
            user_id=admin_user.id,
            role_id=admin_role.id
        ).first()

        if not user_role_link:
            user_role_link = UserRole(
                user_id=admin_user.id,
                role_id=admin_role.id
            )
            db.add(user_role_link)
            db.commit()
            print("Linked Admin user to Admin role.")

        print("\nDatabase seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()