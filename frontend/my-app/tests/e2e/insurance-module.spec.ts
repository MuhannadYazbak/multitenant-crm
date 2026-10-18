import { test, expect } from '@playwright/test';
import { InsuranceClientPage } from '../pages/InsuranceClientPage';
import { TenantLoginPage } from '../pages/TenantLoginPage';
import path from 'path';
import fs from 'fs'

test.describe('Insurance Module - Policy, Vehicle, Property Lifecycle', () => {
    const testTenant = 'company-a';
    let tenantLogin: TenantLoginPage;
    const dummyFilePath = path.join(__dirname, 'test-insurance.txt')

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
        await tenantLogin.login("manager@insurance.com", "my@1234");
        await expect(page).toHaveURL("/company-a/mypage");
        await page.waitForLoadState("networkidle");
    });

    test.afterAll(() => {
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
    });

    test('should create policy, vehicles, properties, and execute drawer actions', async ({ page }) => {
        test.setTimeout(60000);

        const currentUniqueId = Date.now();
        const testPolicyNumber = `POL-TEST-${currentUniqueId}`;
        const testPropertyAddress = `Herzl St ${currentUniqueId}, Tel Aviv`;

        // 1. Generate a pure-letter name to satisfy pattern=r"^[A-Za-z\s'-]+$"
        const randomLetters = Array.from({ length: 6 }, () =>
            String.fromCharCode(97 + Math.floor(Math.random() * 26))
        ).join('');
        const testClient = `Alice ${randomLetters.toUpperCase()}`;
        const testEmail = `alice_${currentUniqueId}@example.com`;

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
            headers['Authorization'] = authHeader; // 👈 Raw authHeader without extra 'Bearer '
        }

        // 3. Seed Client with exact ClientCreate schema matching
        const clientResponse = await page.request.post('http://127.0.0.1:8000/api/clients', {
            headers,
            data: {
                name: testClient,
                email: testEmail,
                phone: '0509876543',
                address: 'Nazareth, Israel',
                status: 'active',
                custom_fields: {}
            }
        });

        if (clientResponse.status() >= 400) {
            console.error('API Error Details:', await clientResponse.text());
        }

        expect([200, 201]).toContain(clientResponse.status());

        const insurancePage = new InsuranceClientPage(page);

        // 4. Load profile page for the newly created unique client
        await insurancePage.goto(testTenant, testClient);

        // 5. Add Vehicle & Property Verticals
        await insurancePage.addVehicle('Skoda', 'Octavia', 2012, '3322211');
        await page.waitForLoadState("networkidle");
        await expect(page.locator('body')).toContainText('3322211');

        await insurancePage.addProperty(testPropertyAddress, '1234');
        await expect(page.locator('body')).toContainText(testPropertyAddress);

        // 6. Add Policy
        await insurancePage.createPolicy(testPolicyNumber, '150000');
        await expect(page.locator('table').first()).toContainText(testPolicyNumber);

        // 7. Open Policy Drawer & Add Note
        await insurancePage.openPolicyDrawer(testPolicyNumber);
        const noteContent = "Policy audit note";
        await insurancePage.addDrawerNote(noteContent);
        await expect(insurancePage.drawerContainer).toContainText(noteContent);

        // 8. Delete Policy
        await insurancePage.deletePolicy();
        await page.waitForTimeout(1500);
        await expect(page.locator('table').first()).not.toContainText(testPolicyNumber);
    });
});