import { test, expect } from '@playwright/test';
import { GeneralClientPage } from '../pages/GeneralClientPage';
import { TenantLoginPage } from '../pages/TenantLoginPage';

test.describe('General Tenant - Direct Tabs Lifecycle', () => {
    const testTenant = 'yazbak';
    const testClient = 'New User';
    let tenantLogin: TenantLoginPage;
    let generalPage: GeneralClientPage;
    test.beforeEach(async ({ page }) => {
        tenantLogin = new TenantLoginPage(page);
    
        // 1. Log in as Tenant Manager
        await tenantLogin.goto();
        await tenantLogin.login("manager@yazbak.com", "my@1234");
        await expect(page).toHaveURL("/yazbak/mypage");
      });

    test('should manage notes directly on client level without drawers', async ({ page, request }) => {
        // Seed Client
        const clientResponse = await request.post('http://127.0.0.1:8000/api/clients', {
            headers: {
                'X-Tenant': testTenant,
                'Content-Type': 'application/json'
            },
            data: {
                name: testClient,
                full_name: testClient,
                email: 'newuser@yazbakm.com',
                phone: '0501203201',
                address: 'Unknown',
                status: 'active',
                custom_fields: {}
            }
        });
        expect([200, 201, 400,401, 409]).toContain(clientResponse.status());

        generalPage = new GeneralClientPage(page);

        // 1. Navigate
        await generalPage.goto(testTenant, testClient);

        // 2. Add Client Note
        const noteText = `General client note ${Date.now()}`;
        await generalPage.addNote(noteText);
        await expect(generalPage.notesList).toContainText(noteText);

        // 3. Delete Note
        await generalPage.deleteFirstNote();
        await expect(generalPage.notesList).not.toContainText(noteText);
    });
});