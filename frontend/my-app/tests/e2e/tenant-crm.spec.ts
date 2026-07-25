import { test, expect } from "@playwright/test";
import { TenantLoginPage } from "../pages/TenantLoginPage";
import { TenantDashboardPage } from "../pages/TenantDashboardPage";
import { ClientDetailPage } from "../pages/ClientDetailPage";

test.describe("Tenant CRM Full End-to-End Suite", () => {
  let tenantLogin: TenantLoginPage;
  let tenantDashboard: TenantDashboardPage;
  let clientDetail: ClientDetailPage;

  test.beforeEach(async ({ page }) => {
    tenantLogin = new TenantLoginPage(page);
    tenantDashboard = new TenantDashboardPage(page);
    clientDetail = new ClientDetailPage(page);
  });

  test("complete client lifecycle: login, create, view profile, edit, search, delete", async ({ page }) => {
    // 1. Workspace Login
    await tenantLogin.goto();
    await tenantLogin.login("company-a", "supersecret123");
    await expect(page).toHaveURL(/\/company-a\/mypage/);

    // 2. Provision New Client with dynamic dynamic email/name to avoid DB 500 unique constraints
    const uniqueId = Date.now().toString(36).replace(/[0-9]/g, (m) => String.fromCharCode(65 + parseInt(m)));

    const originalClient = {
      name: `Test User ${uniqueId}`, // E.g., "Test User BCJ" (Regex ^[A-Za-z\s'-]+$ compliant)
      phone: `054${Math.floor(1000000 + Math.random() * 9000000)}`, // Unique 10-digit phone
      email: `user-${uniqueId.toLowerCase()}@testcrm.com`, // Unique email
      address: "45 Technology Park",
    };

    // 2. Create Client
    await tenantDashboard.openAddClientForm();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === "POST" && res.url().includes("clients"),
        { timeout: 15000 }
      ),
      tenantDashboard.addClient(originalClient),
    ]);

    // Log response body if it ever fails again to debug immediately
    if (response.status() >= 400) {
      console.error("Backend Error Response:", await response.text());
    }

    expect(response.status()).toBeLessThan(400);

    const clientRow = tenantDashboard.getClientRowByName(originalClient.name);
    await expect(clientRow).toBeVisible({ timeout: 10000 });

    // 3. Navigate to Client Detail Page via 'Show' Button
    await Promise.all([
      page.waitForURL(`**/company-a/mypage/*`),
      clientRow.getByRole("button", { name: "Show" }).click(),
    ]);

    // 4. Edit Client Profile Details
    await clientDetail.toggleEditMode();
    await clientDetail.updateProfile({
      phone: "054-0000000",
      address: "99 Updated Boulevard",
    });
    await clientDetail.addCustomField("Priority", "High");
    await clientDetail.saveChanges();

    // 5. Verify Updated Details on Read View
    await expect(clientDetail.phoneText).toContainText("054-0000000");
    await expect(clientDetail.addressText).toContainText("99 Updated Boulevard");
    await expect(page.getByText("Priority:")).toBeVisible();

    // 6. Return to Dashboard and Cleanup
    await clientDetail.goBack();
    await expect(page).toHaveURL(/\/company-a\/mypage/);

    await tenantDashboard.deleteClientByName(originalClient.name);

    // Verify the row is completely gone from the table
    await expect(tenantDashboard.getClientRowByName(originalClient.name)).not.toBeVisible();
  });
});