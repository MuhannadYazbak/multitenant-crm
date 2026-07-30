import { test, expect } from '@playwright/test';
import { InsuranceClientPage } from '../pages/InsuranceClientPage';

test.describe('Insurance Module - Policy Lifecycle & Tabs', () => {
    const testTenant = 'company-a';
    const testClient = 'Alice Smith';
    const testPolicyNumber = `POL-TEST-${Date.now()}`;

    test('should create policy, open drawer, add notes, and delete policy cleanly', async ({ page, request }) => {
        // Seed Client
        const clientResponse = await request.post('http://127.0.0.1:8000/api/clients', {
            headers: {
                'X-Tenant': testTenant,
                'Content-Type': 'application/json'
            },
            data: {
                name: testClient,
                full_name: testClient,
                email: 'alice@example.com',
                phone: '0509876543',
                address: 'Nazareth, Israel',
                status: 'active',
                custom_fields: {}
            }
        });
        expect([200, 201, 400, 409]).toContain(clientResponse.status());

        const insurancePage = new InsuranceClientPage(page);

        // 1. Navigate
        await insurancePage.goto(testTenant, testClient);

        // 2. Add Policy
        await insurancePage.createPolicy(testPolicyNumber, '150000');
        await expect(page.locator('table').first()).toContainText(testPolicyNumber);

        // 3. Open Policy Drawer
        await insurancePage.openPolicyDrawer(testPolicyNumber);

        // 4. Add Note inside Policy Drawer
        const noteContent = `Policy audit note ${Date.now()}`;
        await insurancePage.addDrawerNote(noteContent);
        await expect(insurancePage.drawerContainer).toContainText(noteContent);

        // 5. Delete Policy
        await insurancePage.deletePolicy();

        // 6. Verify instant removal from UI
        await page.waitForTimeout(500);
        await expect(page.locator('table').first()).not.toContainText(testPolicyNumber);
    });
});