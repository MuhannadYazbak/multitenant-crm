# seed_roles.py
from database import SessionLocal
from models import Role

DEFAULT_ROLES = [
    {
        "name": "Admin",
        "permissions": [
            "*:*"  # Full access to all resources and actions
        ]
    },
    {
        "name": "Manager",
        "permissions": [
            "clients:read", "clients:write",
            "notes:read", "notes:write",
            "documents:read", "documents:write",
            "billing:read", "billing:write"
        ]
    },
    {
        "name": "Viewer",
        "permissions": [
            "clients:read",
            "notes:read",
            "documents:read",
            "billing:read"
        ]
    }
]

def seed_roles():
    db = SessionLocal()
    try:
        for role_data in DEFAULT_ROLES:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                role = Role(name=role_data["name"], permissions=role_data["permissions"])
                db.add(role)
                print(f"Added role: {role_data['name']}")
        db.commit()
        print("✅ Default roles seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding roles: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()