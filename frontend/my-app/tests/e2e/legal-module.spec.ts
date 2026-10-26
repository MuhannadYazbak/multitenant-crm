import { test, expect } from '@playwright/test';
import { LegalClientPage } from '../pages/LegalClientPage';
import { TenantLoginPage } from '../pages/TenantLoginPage';
import path from 'path';
import fs from 'fs';

test.describe('Legal Module - Case, Evidence, Witness & Lifecycle', () => {
    const testTenant = 'company-c';
    const uniqueId = Date.now();
    const testCaseNumber = `CAS-TEST-${uniqueId}`;
    const dummyFilePath = path.join(__dirname, `test-legal-${uniqueId}-${Math.random().toString(36).substring(7)}.txt`);
    //const dummyFilePath = path.join(__dirname, 'test-legal.txt');
    let tenantLogin: TenantLoginPage;

    test.beforeAll(() => {
        if (!fs.existsSync(dummyFilePath)) {
            fs.writeFileSync(dummyFilePath, 'Legal contract test content');
        }
    });

    test.beforeEach(async ({ page, context }) => {
        await context.clearCookies();
        tenantLogin = new TenantLoginPage(page);

        // 1. Log in as Tenant Manager
        await tenantLogin.goto();
        await page.evaluate(() => localStorage.clear());
        await tenantLogin.login("manager@legal.com", "my@1234");
        await expect(page).toHaveURL("/company-c/mypage");
        await page.waitForLoadState("networkidle");
    });

    test.afterAll(() => {
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
    });

    test('should manage full legal client lifecycle including evidence and witnesses', async ({ page }) => {
        test.setTimeout(60000);

        // 1. Generate a pure-letter name to satisfy pattern=r"^[A-Za-z\s'-]+$"
        const randomLetters = Array.from({ length: 6 }, () =>
            String.fromCharCode(97 + Math.floor(Math.random() * 26))
        ).join('');
        const testClient = `Charlie ${randomLetters.toUpperCase()}`;
        const testEmail = `charlie_${Date.now()}@example.com`;

        // 2. Retrieve token from browser storage
        const authHeader = await page.evaluate(() => {
            const token = localStorage.getItem('token') ||
                localStorage.getItem('access_token') ||
                sessionStorage.getItem('token');
            return token ? `Bearer ${token}` : null;
        });

        const headers: Record<string, string> = {
            'X-Tenant': testTenant,
            'Content-Type': 'application/json'
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // 3. Seed Client with exact ClientCreate schema matching
        const clientResponse = await page.request.post('http://127.0.0.1:8000/api/clients', {
            headers,
            data: {
                name: testClient,
                phone: '0501234567',
                email: testEmail,
                address: 'Haifa Israel',
                status: 'active',
                custom_fields: {}
            }
        });

        if (clientResponse.status() >= 400) {
            console.error('API Error Details:', await clientResponse.text());
        }

        expect([200, 201]).toContain(clientResponse.status());

        const legalPage = new LegalClientPage(page);

        // 4. Navigate to client legal tab
        await legalPage.goto(testTenant, testClient);

        // 5. Add Evidence & Witness
        const evidenceDetail = `Audio Recording ${uniqueId}`;
        const witnessName = 'Eye Witness';

        await legalPage.addEvidence('Recording', evidenceDetail);
        await expect(page.locator('body')).toContainText(evidenceDetail);

        await legalPage.addWitness(witnessName, 20, '0541112233', 'witness@example.com');
        await expect(page.locator('body')).toContainText(witnessName);

        // 6. Create Case
        await legalPage.createCase(testCaseNumber, 'Civil Litigation', 'Haifa District Court');
        await expect(page.locator('table').first()).toContainText(testCaseNumber);

        // 7. Open Drawer & Upload Doc
        await legalPage.openCaseDrawer(testCaseNumber);
        await legalPage.uploadDocument(dummyFilePath, 'Contract');
        const expectedFileName = path.basename(dummyFilePath);
        await expect(page.locator('table').last()).toContainText(expectedFileName);

        // 8. Soft-Delete (Archive) Doc
        await legalPage.archiveFirstDocument();
        await expect(page.locator('table').last().getByText(expectedFileName)).toBeHidden({ timeout: 10000 });

        // 9. Archive Case
        await legalPage.archiveCurrentCase();
        await page.waitForTimeout(1500);
        await expect(page.locator('table').first()).not.toContainText(testCaseNumber);
    });
});