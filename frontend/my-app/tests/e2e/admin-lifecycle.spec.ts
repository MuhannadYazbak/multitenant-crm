// tests/e2e/admin-lifecycle.spec.ts
import { test, expect } from "@playwright/test";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";

test.describe("Admin System Lifecycle Suite", () => {
  let adminLogin: AdminLoginPage;
  let adminDashboard: AdminDashboardPage;

  const testTenant = {
    name: `playwright-tenant-${Date.now().toString().slice(-4)}`,
    pass: "securePass123",
    type: "insurance" as const,
  };

  test.beforeAll(async ({ request }) => {
    // 1. Authenticate as superadmin to get a token
    const loginRes = await request.post("http://localhost:8000/api/admin/login", {
      data: { email: "superadmin@example.com", password: "your_superadmin_password" } // update credentials as per your test setup
    });

    // Alternatively, if you seed a known token or use API helper:
    // For safety, you can also connect directly via a backend cleanup route if available, 
    // or let the test API handle it.
  });

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    adminLogin = new AdminLoginPage(page);
    adminDashboard = new AdminDashboardPage(page);

    // 1. Log in as superadmin
    await adminLogin.goto();
    await adminLogin.login("admin@example.com", "Admin123456!");
    await expect(page).toHaveURL("/admin/dashboard");
  });

  test("should provision a new tenant and manage lifecycle status", async () => {
    // 2. Provision new workspace
    await adminDashboard.provisionTenant(testTenant.name, testTenant.pass, testTenant.type);
    //await adminDashboard.page.reload();
    // 3. Verify workspace created in ACTIVE state
    await adminDashboard.verifyTenantStatus(testTenant.name, "ACTIVE");

    // 4. Freeze workspace
    await adminDashboard.changeTenantStatus(testTenant.name, "Freeze");
    await adminDashboard.verifyTenantStatus(testTenant.name, "FROZEN");

    // 5. Unfreeze / Reactivate workspace
    await adminDashboard.changeTenantStatus(testTenant.name, "Activate");
    await adminDashboard.verifyTenantStatus(testTenant.name, "ACTIVE");
  });

  test.afterAll(async ({ browser }) => {
    // Call admin delete endpoint or DB clean script to drop the test tenant schema
  });
});