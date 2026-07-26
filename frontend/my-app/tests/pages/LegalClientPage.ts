import { Page, Locator, expect } from '@playwright/test';

export class LegalClientPage {
    readonly page: Page;

    // Header & Modal Locators
    readonly addCaseButton: Locator;
    readonly caseNumberInput: Locator;
    readonly caseTypeSelect: Locator;
    readonly courtInput: Locator;
    readonly submitCaseButton: Locator;

    // Table Locators
    readonly casesTableRows: Locator;

    // Slide-over Drawer Locators
    readonly drawerContainer: Locator;
    readonly drawerHeader: Locator;
    readonly drawerCloseButton: Locator;
    readonly drawerArchiveCaseButton: Locator;

    // Drawer Tabs
    readonly notesTabButton: Locator;
    readonly docsTabButton: Locator;
    readonly billingTabButton: Locator;

    // Documents Tab Locators
    readonly fileInput: Locator;
    readonly categorySelect: Locator;
    readonly uploadDocButton: Locator;
    readonly toggleArchivedDocsButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // 1. Global Dialog Handler: Auto-accept confirm/alert dialogs without race conditions
        this.page.on('dialog', async (dialog) => {
            try {
                await dialog.accept();
            } catch {
                // Safely handle if auto-dismissed
            }
        });

        // Header & Modal
        this.addCaseButton = page.getByRole('button', { name: '+ Add New Case' });
        this.caseNumberInput = page.getByPlaceholder('e.g. CAS-2026-001');
        this.caseTypeSelect = page.locator('select').filter({ hasText: 'Civil Litigation' });
        this.courtInput = page.getByPlaceholder('e.g. Haifa District Court');
        this.submitCaseButton = page.getByRole('button', { name: 'Create Case' });

        // Table
        this.casesTableRows = page.locator('table tbody tr');

        // Drawer Container & Elements
        this.drawerContainer = page.locator('div.fixed.inset-0, [role="dialog"]').last();
        this.drawerHeader = page.locator('.fixed.inset-0 h2');
        this.drawerCloseButton = page.locator('.fixed.inset-0').getByRole('button', { name: '✕' });
        this.drawerArchiveCaseButton = page.getByRole('button', { name: '🗑️ Archive Case' });

        // Tabs
        this.notesTabButton = page.getByRole('button', { name: /notes/i });
        this.docsTabButton = page.getByRole('button', { name: /documents/i });
        this.billingTabButton = page.getByRole('button', { name: /billing/i });

        // Docs Tab
        this.fileInput = page.locator('input[type="file"]');
        this.categorySelect = page.locator('form select');
        this.uploadDocButton = page.getByRole('button', { name: 'Upload', exact: true });
        this.toggleArchivedDocsButton = page.getByRole('button', { name: /Show (Archived|Active) Documents/i });
    }

    async goto(tenant: string, clientName: string) {
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);
    }

    async createCase(caseNumber: string, caseType = 'Civil Litigation', court = 'Haifa District Court') {
        await this.addCaseButton.click();
        await this.caseNumberInput.fill(caseNumber);
        await this.caseTypeSelect.selectOption(caseType);
        await this.courtInput.fill(court);
        await this.submitCaseButton.click();
    }

    async openCaseDrawer(caseNumber: string) {
        const row = this.casesTableRows.filter({ hasText: caseNumber });
        await row.getByRole('button', { name: 'Manage Case →' }).click();
        await expect(this.drawerHeader).toContainText(caseNumber);
    }

    async uploadDocument(filePath: string, category = 'Contract') {
        await this.docsTabButton.click();
        await this.fileInput.setInputFiles(filePath);
        await this.categorySelect.selectOption(category);
        await this.uploadDocButton.click();
    }

    async archiveFirstDocument() {
        // Clicks Archive specifically inside the slide-over drawer table
        await this.drawerContainer.locator('tbody tr').first().getByRole('button', { name: /archive/i }).click();
    }

    async archiveCurrentCase() {
        // Clicks Archive Case button inside drawer
        await this.drawerArchiveCaseButton.click();
    }
}