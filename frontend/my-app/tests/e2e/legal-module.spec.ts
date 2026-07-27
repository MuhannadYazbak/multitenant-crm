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
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`[API ERROR ${response.status()}] ${response.url()}`);
            }
        });

        // 1. Seed Client 'Charlie Brown' matching SQLAlchemy Client model
        const clientResponse = await request.post('http://127.0.0.1:8000/api/clients', {
            headers: {
                'X-Tenant': testTenant, // Matches lib/api.ts
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

        // Log FastAPI 422 errors if any field fails Pydantic validation
        if (clientResponse.status() === 422) {
            console.error('FASTAPI 422 ERROR DETAIL:', await clientResponse.text());
        }

        // 200/201 = Created, 400/409 = Already exists in saas_mvp_test DB
        expect([200, 201, 400, 409]).toContain(clientResponse.status());

        const legalPage = new LegalClientPage(page);

        // 2. Navigate to Client Page
        await legalPage.goto(testTenant, testClient);

        // 3. Create New Legal Case
        await legalPage.createCase(testCaseNumber, 'Civil Litigation', 'Haifa District Court');
        await expect(page.locator('table').first()).toContainText(testCaseNumber);

        // 4. Open Slide-Over Drawer
        await legalPage.openCaseDrawer(testCaseNumber);

        // 5. Upload Document in Sub-Resource Tab
        await legalPage.uploadDocument(dummyFilePath, 'Contract');
        await expect(legalPage.drawerContainer.locator('table')).toContainText('test-doc.txt');

        // 6. Soft Delete / Archive Document inside Drawer
        await legalPage.archiveFirstDocument();
        await expect(legalPage.drawerContainer.locator('table')).not.toContainText('test-doc.txt');

        // Toggle filter to view Archived Documents
        await legalPage.toggleArchivedDocsButton.click();
        await expect(legalPage.drawerContainer.locator('table')).toContainText('test-doc.txt');

        // 7. Soft Delete / Archive Case
        await legalPage.archiveCurrentCase();

        // Brief pause to allow UI state reconciliation and verify table removal
        await page.waitForTimeout(500);
        await expect(page.locator('table').first()).not.toContainText(testCaseNumber);
    });
});