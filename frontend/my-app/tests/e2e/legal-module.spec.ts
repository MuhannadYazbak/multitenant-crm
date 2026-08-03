import { test, expect } from '@playwright/test';
import { LegalClientPage } from '../pages/LegalClientPage';
import path from 'path';
import fs from 'fs';

test.describe('Legal Module - Case, Evidence, Witness & Lifecycle', () => {
    const testTenant = 'company-c';
    const uniqueId = Date.now();
    const testClient = `Charlie Brown ${uniqueId}`;
    const testCaseNumber = `CAS-TEST-${uniqueId}`;
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

    test('should manage full legal client lifecycle including evidence and witnesses', async ({ page, request }) => {
        // Seed Client with unique email/name
        const randomLetters = Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

        const testClient = `Charlie Brown ${randomLetters}`; // Pure letters to satisfy name regex
        const testCaseNumber = `CAS-TEST-${Date.now()}`;

        // Seed Client
        const clientResponse = await request.post('http://127.0.0.1:8000/api/clients', {
            headers: {
                'X-Tenant': testTenant,
                'Content-Type': 'application/json'
            },
            data: {
                name: testClient,
                email: `charlie_${Date.now()}@example.com`,
                phone: '0501234567',
                address: 'Haifa Israel',
                status: 'active',
                custom_fields: {}
            }
        });

        expect([200, 201]).toContain(clientResponse.status());

        const legalPage = new LegalClientPage(page);

        // 1. Pass testClient string
        await legalPage.goto(testTenant, testClient);

        // 2. Add Evidence & Witness
        const evidenceDetail = `Audio Recording ${uniqueId}`;
        const witnessName = 'Eye Witness';

        await legalPage.addEvidence('Recording', evidenceDetail);
        await expect(page.locator('body')).toContainText(evidenceDetail);

        await legalPage.addWitness(witnessName, 20, '0541112233', 'witness@example.com');
        await expect(page.locator('body')).toContainText(witnessName);

        // 3. Create Case
        await legalPage.createCase(testCaseNumber, 'Civil Litigation', 'Haifa District Court');
        await expect(page.locator('table').first()).toContainText(testCaseNumber);

        // 4. Open Drawer & Upload Doc
        await legalPage.openCaseDrawer(testCaseNumber);
        await legalPage.uploadDocument(dummyFilePath, 'Contract');
        const expectedFileName = path.basename(dummyFilePath);
        await expect(page.locator('table').last()).toContainText(expectedFileName);

        // 5. Soft-Delete (Archive) Doc
        await legalPage.archiveFirstDocument();
        await expect(page.locator('table').last().getByText(expectedFileName)).toBeHidden({ timeout: 10000 });

        // 6. Archive Case
        await legalPage.archiveCurrentCase();
        await page.waitForTimeout(500);
        await expect(page.locator('table').first()).not.toContainText(testCaseNumber);
    });
});