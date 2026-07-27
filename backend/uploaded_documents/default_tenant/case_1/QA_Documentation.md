# 📑 Software Testing Documentation (STP & STD)

**Project:** Multi-Tenant SaaS CRM Platform  
**Environment:** `saas_mvp_test`  
**Framework:** Playwright (Page Object Model)  

---

## Part 1: Software Testing Plan (STP)

### 1.1 Scope of Testing

* **In Scope:**
  * **Superadmin Control Plane:** Authentication, platform metrics display, tenant provisioning, lifecycle status management (Active, Suspended, Archived).
  * **Tenant CRM Workspace:** Tenant authentication (`/{slug}`), Client CRUD lifecycle, profile detail views, dynamic custom fields (JSONB), table search/filtering.
  * **System Integration:** Next.js frontend to FastAPI backend communication, isolated PostgreSQL test database transactions.

* **Out of Scope:**
  * Third-party payment gateway integration.
  * Load/stress testing beyond local single-worker concurrency.

### 1.2 Testing Strategy & Methodology

* **Automation Framework:** Playwright E2E suite leveraging the Page Object Model (POM) for locator encapsulation.
* **Database Isolation:** All tests run against a dedicated `saas_mvp_test` database, passed dynamically via `DATABASE_URL` in `playwright.config.ts`.
* **Execution Strategy:** Single-worker sequential execution to prevent database deadlock and race conditions during tenant provisioning.

### 1.3 Entry & Exit Criteria

* **Entry Criteria:**
  * PostgreSQL service running on local port `5432`.
  * FastAPI dependencies installed in `.venv`.
  * Environment variables (`NEXT_PUBLIC_API_BASE_URL`, `DATABASE_URL`) configured.

* **Exit Criteria:**
  * 100% pass rate on defined E2E suites (`admin-lifecycle.spec.ts` & `tenant-crm.spec.ts`).
  * Zero blocking or critical severity open defects.

---

## Part 2: Software Testing Description (STD)

### Suite 1: Superadmin Lifecycle (`tests/e2e/admin-lifecycle.spec.ts`)

| Case ID | Feature | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-ADM-01** | Admin Authentication | 1. Navigate to `/admin/login`<br>2. Enter superadmin credentials<br>3. Click "Login" | Successfully redirect to `/admin/dashboard`. Admin controls become visible. | **PASS** |
| **TC-ADM-02** | System Metrics | 1. Inspect dashboard stat cards | Platform statistics (Active Tenants, DB Health) load and display valid values. | **PASS** |
| **TC-ADM-03** | Tenant Provisioning | 1. Open "Provision Tenant" modal<br>2. Input Name, Slug, Admin Email, Password<br>3. Submit form | New tenant appears in active tenant grid; backend provisions tenant schema. | **PASS** |
| **TC-ADM-04** | Status Management | 1. Select provisioned tenant<br>2. Toggle status to `Suspended`<br>3. Toggle status to `Active` | Status badge updates dynamically in UI and updates in `tenants` DB table. | **PASS** |

---

### Suite 2: Tenant CRM Lifecycle (`tests/e2e/tenant-crm.spec.ts`)

| Case ID | Feature | Test Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-CRM-01** | Workspace Login | 1. Navigate to `/`<br>2. Input tenant domain (`company-a`) and password<br>3. Click "Login" | Authenticates tenant and redirects to `/{tenant-slug}/mypage`. | **PASS** |
| **TC-CRM-02** | Client Creation | 1. Fill "Add Client" form (Name, Email, Phone, Address)<br>2. Click "Save Client" | New client record renders immediately in workspace table. | **PASS** |
| **TC-CRM-03** | Profile Navigation | 1. Locate client in workspace table<br>2. Click "Show" profile button | Page routes to `/{tenant-slug}/mypage/{client_name}` loading profile details. | **PASS** |
| **TC-CRM-04** | Dynamic Fields (JSONB) | 1. Click "Edit Profile"<br>2. Modify phone/address<br>3. Add dynamic key-value field (`Priority: High`)<br>4. Save | Updated text and custom key-value pair render correctly in profile view. | **PASS** |
| **TC-CRM-05** | Table Search | 1. Return to dashboard<br>2. Type client name into search filter | Client list dynamically filters to display matching row. | **PASS** |
| **TC-CRM-06** | Record Teardown | 1. Click "Delete" on client row<br>2. Confirm deletion | Client row disappears from table and record is removed from backend DB. | **PASS** |

---

## Part 3: Software Testing Report (STR Summary)

* **Execution Date:** July 2026
* **Environment:** `saas_mvp_test` (Local Automated `webServer`)
* **Total Executed:** 2 Suites / 2 Integrated End-to-End Test Specs
* **Passed:** 2 (100%)
* **Failed:** 0
* **Execution Time:** ~7.8 seconds total execution time