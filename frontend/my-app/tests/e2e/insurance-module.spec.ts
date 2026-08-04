import { test, expect } from '@playwright/test';
import { InsuranceClientPage } from '../pages/InsuranceClientPage';

test.describe('Insurance Module - Policy, Vehicle, Property Lifecycle', () => {
    const testTenant = 'company-a';
    // Unique name per run to prevent 409 collisions
    const uniqueId = Date.now();
    const testClient = `Alice Smith ${uniqueId}`;
    const testPolicyNumber = `POL-TEST-${uniqueId}`;

    test('should create policy, vehicles, properties, and execute drawer actions', async ({ page, request }) => {
        // Seed Client and verify creation succeeded (200 or 201)
        const uniqueSuffix = Math.random().toString(36).substring(2, 8); // pure letters/digits, but let's stick to letters for name
        const randomLetters = Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

        const testClient = `Alice Smith ${randomLetters}`; // Matches regex ^[A-Za-z\s'-]+$
        const testPolicyNumber = `POL-TEST-${Date.now()}`;

        // Seed Client
        const clientResponse = await request.post('http://127.0.0.1:8000/api/clients', {
            headers: {
                'X-Tenant': testTenant,
                'Content-Type': 'application/json'
            },
            data: {
                name: testClient, // Cleaned up name passing regex
                email: `alice_${Date.now()}@example.com`,
                phone: '0509876543',
                address: 'Nazareth Israel',
                status: 'active',
                custom_fields: {}
            }
        });

        expect([200, 201]).toContain(clientResponse.status());

        const insurancePage = new InsuranceClientPage(page);

        // Pass testClient string so /mypage/Alice%20Smith... loads properly
        await insurancePage.goto(testTenant, testClient);

        // 2. Add Vehicle & Property Verticals
        const testPropertyAddress = `Herzl St ${uniqueId}, Tel Aviv`;

        await insurancePage.addVehicle('Skoda', 'Rapid', 2017, '1122233');
        await expect(page.locator('body')).toContainText('1122233');

        await insurancePage.addProperty(testPropertyAddress, '2500000');
        await expect(page.locator('body')).toContainText(testPropertyAddress);

        // 3. Add Policy
        await insurancePage.createPolicy(testPolicyNumber, '150000');
        await expect(page.locator('table').first()).toContainText(testPolicyNumber);

        // 4. Open Policy Drawer & Add Note
        await insurancePage.openPolicyDrawer(testPolicyNumber);
        const noteContent = `Policy audit note ${uniqueId}`;
        await insurancePage.addDrawerNote(noteContent);
        await expect(insurancePage.drawerContainer).toContainText(noteContent);

        // 5. Delete Policy
        await insurancePage.deletePolicy();
        await page.waitForTimeout(500);
        await expect(page.locator('table').first()).not.toContainText(testPolicyNumber);
    });
});