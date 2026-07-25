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

    // 2. Provision New Client
    const originalClient = {
      name: "My New Tesr User", // Strict Pydantic regex compliant
      phone: "0549876542",
      email: "user@newtest.com",
      address: "45 Technology Park",
    };

    // Submit form and wait for backend API response
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/clients") && res.status() < 400),
      tenantDashboard.addClient(originalClient),
    ]);

    const clientRow = tenantDashboard.getClientRowByName(originalClient.name);
    await expect(clientRow).toBeVisible({ timeout: 10000 });

    // 3. Navigate to Client Detail Page via 'Show' Button
    // Bind click and navigation concurrently so Next.js router.push finishes cleanly
    await Promise.all([
      page.waitForURL(new RegExp(`.*/mypage/${encodeURIComponent(originalClient.name)}`)),
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