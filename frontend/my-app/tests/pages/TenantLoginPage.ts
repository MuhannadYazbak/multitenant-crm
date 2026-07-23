import { Locator, Page } from "@playwright/test";

export class TenantLoginPage {
  readonly page: Page;
  readonly companyDomainInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly adminPortalLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators based on labels, placeholders, role, and text content
    this.companyDomainInput = page.getByPlaceholder("e.g. company-a");
    this.passwordInput = page.getByPlaceholder("••••••••");
    this.loginButton = page.getByRole("button", { name: /Login to Workspace|Verifying.../i });
    this.errorMessage = page.locator(".text-red-500");
    this.adminPortalLink = page.getByRole("link", { name: "Admin Tenant Portal →" });
  }

  async goto() {
    // Navigates to the tenant login route
    await this.page.goto("/"); 
  }

  async login(companyDomain: string, password: string) {
    await this.companyDomainInput.fill(companyDomain);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}