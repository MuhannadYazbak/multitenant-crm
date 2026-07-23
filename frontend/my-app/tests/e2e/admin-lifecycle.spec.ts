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

  test.beforeEach(async ({ page }) => {
    adminLogin = new AdminLoginPage(page);
    adminDashboard = new AdminDashboardPage(page);

    // 1. Log in as superadmin
    await adminLogin.goto();
    await adminLogin.login("admin", "admin123");
    await expect(page).toHaveURL("/admin/dashboard");
  });

  test("should provision a new tenant and manage lifecycle status", async () => {
    // 2. Provision new workspace
    await adminDashboard.provisionTenant(testTenant.name, testTenant.pass, testTenant.type);

    // 3. Verify workspace created in ACTIVE state
    await adminDashboard.verifyTenantStatus(testTenant.name, "ACTIVE");

    // 4. Freeze workspace
    await adminDashboard.changeTenantStatus(testTenant.name, "Freeze");
    await adminDashboard.verifyTenantStatus(testTenant.name, "FROZEN");

    // 5. Unfreeze / Reactivate workspace
    await adminDashboard.changeTenantStatus(testTenant.name, "Activate");
    await adminDashboard.verifyTenantStatus(testTenant.name, "ACTIVE");
  });
});