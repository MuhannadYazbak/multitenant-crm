import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

test.describe('Password Reset E2E Flow (POM)', () => {
  let forgotPasswordPage: ForgotPasswordPage;
  let resetPasswordPage: ResetPasswordPage;

  test.beforeEach(async ({ page }) => {
    forgotPasswordPage = new ForgotPasswordPage(page);
    resetPasswordPage = new ResetPasswordPage(page);
  });

  test('Tenant - Submit forgot password, intercept dev token, and update password', async () => {
    await forgotPasswordPage.goto();
    
    const { devResetUrl } = await forgotPasswordPage.requestReset('company-a');
    expect(devResetUrl).toBeDefined();

    await resetPasswordPage.goto(devResetUrl);
    await resetPasswordPage.resetPassword('NewTenantSecret123!');

    await expect(resetPasswordPage.successMessage).toBeVisible();
  });

  test('Superadmin - Submit forgot password, intercept dev token, and update password', async () => {
    await forgotPasswordPage.goto();

    const { devResetUrl } = await forgotPasswordPage.requestReset('admin');
    expect(devResetUrl).toBeDefined();

    await resetPasswordPage.goto(devResetUrl);
    await resetPasswordPage.resetPassword('NewAdminSecret456!');

    await expect(resetPasswordPage.successMessage).toBeVisible();
  });
});