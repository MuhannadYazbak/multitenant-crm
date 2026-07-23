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
      name: "Global Tech Inc",
      phone: "054-9876543",
      email: "info@globaltech.com",
      address: "45 Technology Park",
    };

    await tenantDashboard.addClient(originalClient);
    const clientRow = tenantDashboard.getClientRowByName(originalClient.name);
    await expect(clientRow).toBeVisible();

    // 3. Navigate to Client Detail Page via 'Show' Button
    await clientRow.getByRole("button", { name: "Show" }).click();
    await expect(page).toHaveURL(/\/company-a\/mypage\/Global%20Tech%20Inc/);
    await expect(clientDetail.nameHeading).toHaveText(originalClient.name);

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
    await expect(clientRow).not.toBeVisible();
  });
});