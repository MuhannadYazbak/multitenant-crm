import { test, expect } from '@playwright/test';
import { LegalClientPage } from '../pages/LegalClientPage';
import path from 'path';
import fs from 'fs';

test.describe('Legal Module - Case & Soft Delete Lifecycle', () => {
  const testTenant = 'company-c';
  const testClient = 'Charlie Brown';
  const testCaseNumber = `CAS-TEST-${Date.now()}`;
  const dummyFilePath = path.join(__dirname, 'test-doc.txt');

  test.beforeAll(() => {
    if (!fs.existsSync(dummyFilePath)) {
      fs.writeFileSync(dummyFilePath, 'Legal contract test content');
    }
  });

  test.afterAll(() => {
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  });

  test('should create a case, manage sub-resources, soft-delete doc, and archive case', async ({ page }) => {
    const legalPage = new LegalClientPage(page);

    // 1. Navigate to Client Page
    await legalPage.goto(testTenant, testClient);

    // 2. Create New Legal Case
    await legalPage.createCase(testCaseNumber, 'Civil Litigation', 'Haifa District Court');
    await expect(page.locator('table').first()).toContainText(testCaseNumber);

    // 3. Open Slide-Over Drawer
    await legalPage.openCaseDrawer(testCaseNumber);

    // 4. Upload Document in Sub-Resource Tab
    await legalPage.uploadDocument(dummyFilePath, 'Contract');
    await expect(legalPage.drawerContainer.locator('table')).toContainText('test-doc.txt');

    // 5. Soft Delete / Archive Document inside Drawer
    await legalPage.archiveFirstDocument();
    await expect(legalPage.drawerContainer.locator('table')).not.toContainText('test-doc.txt');

    // Toggle filter to view Archived Documents
    await legalPage.toggleArchivedDocsButton.click();
    await expect(legalPage.drawerContainer.locator('table')).toContainText('test-doc.txt');

    // 6. Soft Delete / Archive Case
    await legalPage.archiveCurrentCase();

    // Give UI a brief moment to update state and check main cases table
    await page.waitForTimeout(500);
    await expect(page.locator('table').first()).not.toContainText(testCaseNumber);
  });
});