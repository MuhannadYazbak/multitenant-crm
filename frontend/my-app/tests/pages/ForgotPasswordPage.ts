import { Page, Locator, Response } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly tenantOrAdminInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tenantOrAdminInput = page.getByPlaceholder('e.g. admin or company-b');
    this.submitButton = page.getByRole('button', { name: 'Generate Reset Link' });
  }

  async goto() {
    await this.page.goto('/forgot-password');
  }

  async requestReset(identifier: string): Promise<{ response: Response; devResetUrl: string }> {
    const apiResponsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/auth/forgot-password') && response.status() === 200
    );

    await this.tenantOrAdminInput.fill(identifier);
    await this.submitButton.click();

    const response = await apiResponsePromise;
    const body = await response.json();
    
    return {
      response,
      devResetUrl: body.dev_reset_url,
    };
  }
}