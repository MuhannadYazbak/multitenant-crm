# conftest.py
import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db_for_tenant

class MockTenantDB:
    def __init__(self, tenant_type="legal"):
        self.info = {"tenant_type": tenant_type, "tenant_slug": "test_tenant"}
        self.added = []
        self.deleted = []

    def query(self, *args, **kwargs):
        return self

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return None

    def all(self):
        return []

    def count(self):
        return 0

    def add(self, item):
        self.added.append(item)

    def delete(self, item):
        self.deleted.append(item)

    def flush(self):
        pass

    def commit(self):
        pass

    def refresh(self, item):
        pass

@pytest.fixture
def mock_db():
    return MockTenantDB(tenant_type="legal")

@pytest.fixture
def client(mock_db):
    app.dependency_overrides[get_db_for_tenant] = lambda: mock_db
    yield TestClient(app)
    app.dependency_overrides.clear()