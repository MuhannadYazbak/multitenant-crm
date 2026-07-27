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
        
        // 💡 FIX 1: Direct locator for case type dropdown
        this.caseTypeSelect = page.locator('select[name="case_type"], select').first();
        
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
        this.fileInput = this.drawerContainer.locator('input[type="file"]');
        this.categorySelect = this.drawerContainer.locator('select').first();
        this.uploadDocButton = this.drawerContainer.getByRole('button', { name: 'Upload', exact: true });
        this.toggleArchivedDocsButton = page.getByRole('button', { name: /Show (Archived|Active) Documents/i });
    }

    async goto(tenant: string, clientName: string) {
        // 1. Navigate directly to the client profile route
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);

        // 2. Wait explicitly for "Loading profile details..." spinner to clear
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading profile details...'),
            { timeout: 10000 }
        );

        // 3. Ensure network calls (like fetchClientCases) settle
        await this.page.waitForLoadState('networkidle');
    }

    async createCase(caseNumber: string, caseType = 'Civil Litigation', court = 'Haifa District Court') {
        await this.addCaseButton.click();
        await this.caseNumberInput.fill(caseNumber);
        
        // Select by option value or label safely
        await this.caseTypeSelect.selectOption({ label: caseType }).catch(async () => {
            await this.caseTypeSelect.selectOption(caseType);
        });

        await this.courtInput.fill(court);
        await this.submitCaseButton.click();

        // 💡 FIX 2: Wait for modal to complete POST request to /api/legal/cases
        await this.page.waitForLoadState('networkidle');
    }

    async openCaseDrawer(caseNumber: string) {
        const row = this.casesTableRows.filter({ hasText: caseNumber });
        await row.getByRole('button', { name: 'Manage Case →' }).click();
        await expect(this.drawerHeader).toContainText(caseNumber);
    }

    async uploadDocument(filePath: string, category = 'Contract') {
        // 1. Switch to Documents tab
        await this.docsTabButton.click();

        // 2. Locate input inside drawer
        const fileInput = this.drawerContainer.locator('input[type="file"]');
        await fileInput.waitFor({ state: 'attached' });

        // 3. Attach file
        await fileInput.setInputFiles(filePath);

        // 4. Select category if present
        if (category) {
            await this.categorySelect.selectOption(category).catch(() => {});
        }

        // 5. Wait for upload button to be enabled
        await expect(this.uploadDocButton).toBeEnabled({ timeout: 5000 });

        // 6. Click Upload and settle
        await this.uploadDocButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async archiveFirstDocument() {
        await this.drawerContainer.locator('tbody tr').first().getByRole('button', { name: /archive/i }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async archiveCurrentCase() {
        await this.drawerArchiveCaseButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}