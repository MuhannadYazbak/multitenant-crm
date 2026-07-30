import { Page, Locator, expect } from '@playwright/test';

export class InsuranceClientPage {
    readonly page: Page;

    // Header & Modal
    readonly addPolicyButton: Locator;
    readonly policyNumberInput: Locator;
    readonly coverageAmountInput: Locator;
    readonly submitPolicyButton: Locator;

    // Table
    readonly policiesTableRows: Locator;

    // Slide-over Drawer Locators
    readonly drawerContainer: Locator;
    readonly drawerHeader: Locator;
    readonly drawerDeletePolicyButton: Locator;

    // Drawer Tabs & Form Controls
    readonly notesTabButton: Locator;
    readonly drawerAuthorInput: Locator;
    readonly drawerNoteInput: Locator;
    readonly drawerAddNoteButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.page.on('dialog', async (dialog) => {
            try { await dialog.accept(); } catch {}
        });

        // Modal Controls
        this.addPolicyButton = page.getByRole('button', { name: /add.*policy/i });
        this.policyNumberInput = page.locator('input[placeholder*="POL"], input[name="policyNumber"], input').first();
        this.coverageAmountInput = page.locator('input[type="number"], input[placeholder*="coverage"]').first();
        this.submitPolicyButton = page.getByRole('button', { name: /create|save|add/i }).last();

        // Table
        this.policiesTableRows = page.locator('table tbody tr');

        // Drawer Container
        this.drawerContainer = page.locator('div.fixed.inset-0, [role="dialog"]').last();
        this.drawerHeader = this.drawerContainer.locator('h2');
        this.drawerDeletePolicyButton = this.drawerContainer.getByRole('button', { name: /delete/i });

        // Drawer Tabs & Notes Form Controls matching TabsSection.tsx
        this.notesTabButton = this.drawerContainer.getByRole('button', { name: /Notes/i });
        this.drawerAuthorInput = this.drawerContainer.getByPlaceholder('Author Name');
        this.drawerNoteInput = this.drawerContainer.getByPlaceholder('Type note details...');
        this.drawerAddNoteButton = this.drawerContainer.getByRole('button', { name: 'Post Note', exact: true });
    }

    async goto(tenant: string, clientName: string) {
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading profile details...'),
            { timeout: 10000 }
        );
        await this.page.waitForLoadState('networkidle');
    }

    async createPolicy(policyNumber: string, coverageAmount: string) {
        await this.addPolicyButton.click();
        await this.policyNumberInput.fill(policyNumber);
        await this.coverageAmountInput.fill(coverageAmount);
        await this.submitPolicyButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async openPolicyDrawer(policyNumber: string) {
        const row = this.policiesTableRows.filter({ hasText: policyNumber });
        await row.getByRole('button', { name: /manage|view|→/i }).click();
        await expect(this.drawerHeader).toContainText(policyNumber);
    }

    async addDrawerNote(content: string, author: string = 'Insurance Agent') {
        await this.notesTabButton.click();
        await this.drawerAuthorInput.fill(author);
        await this.drawerNoteInput.fill(content);
        await this.drawerAddNoteButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deletePolicy() {
        await this.drawerDeletePolicyButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}