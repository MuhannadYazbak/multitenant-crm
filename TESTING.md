# 🧪 End-to-End Testing Documentation

## Overview

This document outlines the End-to-End (E2E) testing strategy, architecture, and suite execution for the Multi-Tenant SaaS CRM application.

The primary goal of this testing suite is to validate core system reliability across both the **Superadmin Control Plane** and **Tenant CRM Workspaces**, ensuring complete data isolation, correct RBAC, and seamless UI workflows.

---

## 🛠️ Tech Stack & Environment

| Component | Tool / Specification | Description |
| :--- | :--- | :--- |
| **Framework** | Playwright | Multi-browser automation engine executing end-to-end user workflows. |
| **Design Pattern** | Page Object Model (POM) | Encapsulates page locators and interaction logic into reusable classes. |
| **Backend** | FastAPI (Python) | Managed dynamically via Playwright `webServer` during test runs. |
| **Frontend** | Next.js (TypeScript) | Managed dynamically via Playwright `webServer` on port `3000`. |
| **Database** | PostgreSQL (`saas_mvp_test`) | Isolated test database created specifically to avoid touching dev/prod data. |

---

## 📑 Test Suites & Coverage Matrix

### 1. Superadmin Lifecycle Suite (`tests/e2e/admin-lifecycle.spec.ts`)

Validates high-level system operations from the platform owner's perspective.

* **[x] Superadmin Authentication:** Authenticates superadmin credentials and validates session redirect to `/admin/dashboard`.
* **[x] Platform Metrics:** Verifies core dashboard stats (active tenants, platform health, database status).
* **[x] Tenant Provisioning:** Dynamically provisions new enterprise tenants with unique slugs.
* **[x] Lifecycle Management:** Toggles tenant operational statuses (Active, Suspended, Archived) and verifies UI updates.

### 2. Tenant CRM Lifecycle Suite (`tests/e2e/tenant-crm.spec.ts`)

Validates workspace-level operations and core CRM features for onboarded clients.

* **[x] Tenant Authentication:** Validates workspace login at `/{tenant_slug}` root route.
* **[x] Client Provisioning (CRUD):** Creates new clients with full contact info (name, email, phone, address).
* **[x] Dynamic Detail Routing:** Navigates from workspace table view to individual client profiles (`/{tenant_slug}/mypage/{client_name}`).
* **[x] Custom Fields & JSONB:** Edits contact info and dynamically attaches custom dynamic key-value attributes.
* **[x] Search & Search Filtering:** Filters workspace tables dynamically by client attributes.
* **[x] Teardown & Deletion:** Deletes clients and verifies complete removal from UI and underlying database.

---

## 🏗️ Architecture & Design Pattern (POM)

To ensure low maintenance overhead and high resilience against UI layout changes, tests are structured using the Page Object Model:

```text
frontend/my-app/
└── tests/
    ├── e2e/
    │   ├── admin-lifecycle.spec.ts   # Superadmin flow specs
    │   └── tenant-crm.spec.ts        # Tenant CRM flow specs
    └── pages/
        ├── AdminLoginPage.ts         # POM: Superadmin Auth
        ├── AdminDashboardPage.ts     # POM: Tenant provisioning & metrics
        ├── TenantLoginPage.ts        # POM: Workspace auth
        ├── TenantDashboardPage.ts    # POM: Client table & quick actions
        └── ClientDetailPage.ts       # POM: Profile editing & dynamic JSONB fields

```

## 🚀 How to Run the Tests

### Prerequisites

1. Ensure the backend virtual environment contains all required dependencies.
2. Ensure PostgreSQL is running locally with the target database created (`saas_mvp_test`).

### Execution Commands

```bash
# 1. Run all E2E tests in headless mode
npx playwright test

# 2. Run a specific test suite
npx playwright test tests/e2e/admin-lifecycle.spec.ts
npx playwright test tests/e2e/tenant-crm.spec.ts

# 3. Run tests with interactive Playwright UI Runner (Debugging Mode)
npx playwright test --ui

# 4. View HTML Test Execution Report
npx playwright show-report
```

### 🔑 Environment Variables
* **Configuration:** The testing suite relies on environment variables passed into the webServer orchestrator inside playwright.config.ts:
* **DATABASE_URL:** postgresql://postgres:***@localhost:5432/saas_mvp_test (Enforces test * *isolation)NEXT_PUBLIC_API_BASE_URL: http://localhost:8000 (Configures frontend backend target)
* **SECRET_KEY:** HMAC-SHA256 compliant key ($\ge$ 32 characters)