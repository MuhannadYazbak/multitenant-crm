import { test, expect } from '@playwright/test';
import { GeneralClientPage } from '../pages/GeneralClientPage';

test.describe('General Tenant - Direct Tabs Lifecycle', () => {
    const testTenant = 'company-b';
    const testClient = 'Bob Jones';

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
                email: 'bob@example.com',
                phone: '0505554433',
                address: 'Tel Aviv, Israel',
                status: 'active',
                custom_fields: {}
            }
        });
        expect([200, 201, 400, 409]).toContain(clientResponse.status());

        const generalPage = new GeneralClientPage(page);

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