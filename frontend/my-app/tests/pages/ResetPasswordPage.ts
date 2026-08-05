import { Page, Locator } from '@playwright/test';

export class ResetPasswordPage {
  readonly page: Page;
  readonly newPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newPasswordInput = page.locator('input[name="new_password"]');
    this.submitButton = page.getByRole('button', { name: /reset|update|submit/i });
    this.successMessage = page.getByText(/Password updated successfully/i);
  }

  async goto(resetUrl: string) {
    await this.page.goto(resetUrl);
  }

  async resetPassword(password: string) {
    await this.newPasswordInput.fill(password);
    await this.submitButton.click();
  }
}