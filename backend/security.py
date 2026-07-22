import bcrypt

def hash_password(password: str) -> str:
    """Generates a secure salt and hashes the password using native bcrypt."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Validates a plain password against the stored database hash."""
    # 1. Check if the stored string is a valid bcrypt hash signature
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception:
            return False
            
    # 2. Fallback check for unhashed legacy/testing rows in public.tenant_accounts
    return plain_password == hashed_password