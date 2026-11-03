import { test, expect } from '@playwright/test';
import { GeneralClientPage } from '../pages/GeneralClientPage';
import { TenantLoginPage } from '../pages/TenantLoginPage';

test.describe('General Tenant - Direct Tabs Lifecycle', () => {
    const testTenant = 'yazbak';
    let tenantLogin: TenantLoginPage;
    let generalPage: GeneralClientPage;

    
    test.beforeEach(async ({ page, context }) => {
        await context.clearCookies();
        tenantLogin = new TenantLoginPage(page);

        // 1. Log in as Tenant Manager
        await tenantLogin.goto();
        await page.evaluate(() => {localStorage.clear(); sessionStorage.clear()});
        await tenantLogin.login("manager@yazbak.com", "my@1234");
        await expect(page).toHaveURL("/yazbak/mypage");
        await page.waitForLoadState("networkidle");

        // Guarantee local storage actually received a token before proceeding
        const token = await page.evaluate(() =>
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token')
        );
        expect(token, 'Failed to acquire auth token after login - check DB seed credentials!').toBeTruthy();
    });

    test('should manage notes directly on client level without drawers', async ({ page }) => {
        test.setTimeout(60000);

        const currentUniqueId = Date.now();
        const randomLetters = Array.from({ length: 6 }, () =>
            String.fromCharCode(97 + Math.floor(Math.random() * 26))
        ).join('');
        const testClient = `User ${randomLetters.toUpperCase()}`;
        const testEmail = `user_${currentUniqueId}@yazbakm.com`;

        // 1. Retrieve Auth Token from Local Storage
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

        // 2. Seed Client via page.request with Bearer Token
        const randomPhoneNum = `050${Math.floor(1000000 + Math.random() * 9000000)}`;
        const clientResponse = await page.request.post('http://127.0.0.1:8000/api/clients', {
            headers,
            data: {
                name: testClient,
                email: testEmail,
                phone: randomPhoneNum,
                address: 'Nazareth, Norethern Israel',
                status: 'active',
                custom_fields: {}
            }
        });

        if (clientResponse.status() >= 400) {
            console.error('API Seeding Error:', await clientResponse.text());
        }

        // Strict assertion: Reject 401 or 409
        expect([200, 201]).toContain(clientResponse.status());

        generalPage = new GeneralClientPage(page);

        // 3. Navigate to Client Profile
        await generalPage.goto(testTenant, testClient);

        // 4. Add Client Note
        const noteText = `General client note ${currentUniqueId}`;
        await generalPage.addNote(noteText);
        await expect(generalPage.notesList).toContainText(noteText);

        // 5. Delete Note
        await generalPage.deleteFirstNote();
        await page.waitForTimeout(1500);
        await expect(generalPage.notesList).not.toContainText(noteText);
    });
});