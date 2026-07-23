// tests/pages/AdminDashboardPage.ts
import { Page, Locator, expect } from "@playwright/test";

export class AdminDashboardPage {
  readonly page: Page;
  readonly addTenantButton: Locator;
  readonly logoutButton: Locator;
  
  // Modal locators
  readonly companyNameInput: Locator;
  readonly passwordInput: Locator;
  readonly tenantTypeSelect: Locator;
  readonly modalCreateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addTenantButton = page.locator("button", { hasText: "+ Add Tenant" });
    this.logoutButton = page.locator("button", { hasText: "Log Out" });

    // Provisioning Modal
    this.companyNameInput = page.locator('input[placeholder="e.g. company-e"]');
    this.passwordInput = page.locator('input[placeholder="••••••••"]');
    this.tenantTypeSelect = page.locator("select");
    this.modalCreateButton = page.locator("button", { hasText: "Create Tenant" });
  }

  async openProvisionModal() {
    await this.addTenantButton.click();
  }

  async provisionTenant(name: string, pass: string, type: "general" | "insurance" | "legal") {
    await this.openProvisionModal();
    await this.companyNameInput.fill(name);
    await this.passwordInput.fill(pass);
    await this.tenantTypeSelect.selectOption(type);
    await this.modalCreateButton.click();
  }

  getTenantRow(companyName: string): Locator {
    return this.page.locator("tr", { hasText: companyName });
  }

  async changeTenantStatus(companyName: string, targetStatus: "Activate" | "Freeze" | "Delete") {
    const row = this.getTenantRow(companyName);
    const actionButton = row.locator("button", { hasText: targetStatus });
    await actionButton.click();
  }

  async verifyTenantStatus(companyName: string, statusText: "ACTIVE" | "FROZEN" | "DELETED") {
    const row = this.getTenantRow(companyName);
    await expect(row).toContainText(statusText);
  }
}