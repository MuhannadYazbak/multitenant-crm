import { Locator, Page } from "@playwright/test";

export class TenantLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly adminPortalLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators based on labels, placeholders, role, and text content
    this.emailInput = page.getByPlaceholder("user@company.com");
    this.passwordInput = page.getByPlaceholder("••••••••");
    //this.loginButton = page.getByPlaceholder("Sign In");
    this.loginButton = page.locator("#SignIn");
    this.errorMessage = page.locator(".text-red-500");
    this.adminPortalLink = page.getByRole("link", { name: "Admin Tenant Portal →" });
  }

  async goto() {
    // Navigates to the tenant login route
    await this.page.goto("/"); 
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}