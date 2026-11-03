# test_legal_router.py
from datetime import datetime, timezone
from unittest.mock import patch
from main import app
from auth_utils import get_current_user
from rbac import require_permission
import models


def test_create_case_unauthorized_permission(client):
    response = client.post("/api/legal/cases", json={
        "case_number": "CAS-101",
        "case_type": "Civil",
        "client_id": 1
    })
    assert response.status_code in (401, 403)


def test_legal_tenant_guard(client, mock_db):
    test_user = models.User(id=1, email="lawyer@example.com")
    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[require_permission("legal:read")] = lambda: test_user

    mock_db.info["tenant_type"] = "general"
    response = client.get("/api/legal/dashboard/stats")

    app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "Legal module is disabled for this tenant"


@patch("routers.legal.log_activity")
def test_create_case_audit_logging(mock_log_activity, client, mock_db):
    test_user = models.User(id=1, email="lawyer@example.com")
    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[require_permission("legal:write")] = lambda: test_user

    # Intercept db.add to populate auto-generated database fields
    def mock_add(instance):
        if not getattr(instance, "id", None):
            instance.id = 1
        if not getattr(instance, "created_at", None):
            instance.created_at = datetime.now(timezone.utc)

    mock_db.add = mock_add

    payload = {
        "case_number": "CAS-2024-001",
        "case_type": "Litigation",
        "court": "District Court",
        "status": "Open",
        "client_id": 1
    }

    response = client.post("/api/legal/cases", json=payload)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert mock_log_activity.called
    assert mock_log_activity.call_args.kwargs["action"] == "LEGAL_CASE_CREATED"