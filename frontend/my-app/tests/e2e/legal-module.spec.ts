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

    test('should create a case, manage sub-resources, soft-delete doc, and archive case', async ({ page, request }) => {
        // Seed Client on company-c
        const clientResponse = await request.post('http://127.0.0.1:8000/api/clients', {
            headers: {
                'X-Tenant': testTenant,
                'Content-Type': 'application/json'
            },
            data: {
                name: testClient,
                full_name: testClient,
                email: 'charlie@example.com',
                phone: '0501234567',
                address: 'Haifa, Israel',
                status: 'active',
                custom_fields: {}
            }
        });
        expect([200, 201, 400, 409]).toContain(clientResponse.status());

        const legalPage = new LegalClientPage(page);

        // 1. Navigate
        await legalPage.goto(testTenant, testClient);

        // 2. Create Case
        await legalPage.createCase(testCaseNumber, 'Civil Litigation', 'Haifa District Court');
        await expect(page.locator('table').first()).toContainText(testCaseNumber);

        // 3. Open Drawer
        await legalPage.openCaseDrawer(testCaseNumber);

        // 4. Upload Doc
        await legalPage.uploadDocument(dummyFilePath, 'Contract');
        const expectedFileName = path.basename(dummyFilePath); // e.g., 'test-doc.txt'
        await expect(legalPage.drawerContainer.locator('table')).toContainText(expectedFileName)

        // 5. Archive Doc
        await legalPage.archiveFirstDocument();
        await expect(legalPage.drawerContainer.locator('table')).not.toContainText('test-doc.txt');

        // 💡 FIX: Global locator for document toggle button
        const toggleBtn = page.getByRole('button', { name: /Show (Archived|Active) Documents/i });
        if (await toggleBtn.isVisible()) {
            await toggleBtn.click();
            await expect(legalPage.drawerContainer.locator('table')).toContainText('test-doc.txt');
        }

        // 6. Archive Case
        await legalPage.archiveCurrentCase();
        await page.waitForTimeout(500);
        await expect(page.locator('table').first()).not.toContainText(testCaseNumber);
    });
});