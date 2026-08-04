import { Page, Locator, expect } from '@playwright/test';

export class LegalClientPage {
    readonly page: Page;

    // Header & Case Modal Locators
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

    // Drawer & Vertical Tabs
    readonly casesTab: Locator;
    readonly notesTabButton: Locator;
    readonly docsTabButton: Locator;
    readonly billingTabButton: Locator;
    readonly evidenceTab: Locator;
    readonly witnessesTab: Locator;

    // Documents Tab Locators
    readonly fileInput: Locator;
    readonly categorySelect: Locator;
    readonly uploadDocButton: Locator;
    readonly toggleArchivedDocsButton: Locator;

    // Evidence Modal Locators
    readonly addEvidenceButton: Locator;
    //readonly submitEvidenceButton: Locator;

    // Witness Modal Locators
    readonly addWitnessButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.page.on('dialog', async (dialog) => {
            try { await dialog.accept(); } catch { }
        });

        // Header & Modal
        this.addCaseButton = page.getByRole('button', { name: '+ Add New Case' });
        this.caseNumberInput = page.getByPlaceholder('e.g. CAS-2026-001');
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
        this.casesTab = page.getByRole('button', { name: /cases/i });
        this.notesTabButton = page.getByRole('button', { name: /notes/i });
        this.docsTabButton = page.getByRole('button', { name: /documents/i });
        this.billingTabButton = page.getByRole('button', { name: /billing/i });
        this.evidenceTab = page.getByRole('button', { name: /evidence/i });
        this.witnessesTab = page.getByRole('button', { name: /witness/i });

        // Docs Tab
        this.fileInput = this.drawerContainer.locator('input[type="file"]');
        this.categorySelect = this.drawerContainer.locator('select').first();
        this.uploadDocButton = this.drawerContainer.getByRole('button', { name: 'Upload', exact: true });
        this.toggleArchivedDocsButton = page.locator('#archive/unarchive');

        // Action Trigger Buttons on the main tab panels
        this.addEvidenceButton = page.locator('#addEvidenceBtn');
        this.addWitnessButton = page.locator('#addWitnessBtn');
    }

    // LegalClientPage.ts & InsuranceClientPage.ts
    async goto(tenant: string, clientName: string) {
        // 1. Navigate to client page
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);

        // 2. Wait for profile header containing client's name to render
        await this.page.locator('h1, h2', { hasText: clientName }).waitFor({ state: 'visible', timeout: 10000 });

        // 3. Ensure loading overlay/spinner is gone before interacting
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading'),
            { timeout: 10000 }
        );

        await this.page.waitForLoadState('networkidle');
    }

    async clickCasesTab() {
        await this.casesTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.casesTab.click();
    }

    async createCase(caseNumber: string, caseType = 'Civil Litigation', court = 'Haifa District Court') {
        // 1. Switch back to Cases tab from Witness/Evidence tab
        await this.clickCasesTab();

        // 2. Click + Add New Case
        await this.addCaseButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.addCaseButton.click();

        // 3. Target Case Modal Form specifically
        const caseModal = this.page.locator('div.fixed, [role="dialog"]').filter({ hasText: 'Create Case' });

        await caseModal.getByPlaceholder('e.g. CAS-2026-001').fill(caseNumber);

        const select = caseModal.locator('select').first();
        await select.selectOption({ label: caseType }).catch(async () => {
            await select.selectOption(caseType);
        });

        await caseModal.getByPlaceholder('e.g. Haifa District Court').fill(court);

        // 4. Submit
        await caseModal.getByRole('button', { name: 'Create Case' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async openCaseDrawer(caseNumber: string) {
        const row = this.casesTableRows.filter({ hasText: caseNumber });
        await row.getByRole('button', { name: 'Manage Case →' }).click();

        // Wait for the drawer heading containing the case number to be visible
        await this.page.locator('h2, h3').filter({ hasText: caseNumber }).waitFor({ state: 'visible', timeout: 10000 });
    }

    async uploadDocument(filePath: string, category: string = 'General') {
        // 1. Ensure Documents tab in drawer is active
        await this.docsTabButton.click();

        // 2. Attach file
        const fileInput = this.page.locator('input[type="file"]').first();
        await fileInput.waitFor({ state: 'attached', timeout: 10000 });
        await fileInput.setInputFiles(filePath);

        // Explicitly dispatch change event so React form state updates immediately
        await fileInput.dispatchEvent('change');

        // 3. Category selection (Match label or value dynamically)
        const categorySelect = this.page.locator('select').filter({ hasText: /general|contract|legal/i }).first();
        if (await categorySelect.isVisible()) {
            try {
                await categorySelect.selectOption({ label: category });
            } catch {
                try {
                    await categorySelect.selectOption(category.toLowerCase());
                } catch {
                    // Properly awaited fallback to second option
                    await categorySelect.selectOption({ index: 1 });
                }
            }
            // Force change event on select to guarantee state sync in React
            await categorySelect.dispatchEvent('change');
        }

        // 4. Wait for the upload button to be enabled (bumped timeout slightly for parallel workers)
        const uploadBtn = this.page.getByRole('button', { name: /^Upload$/i });
        await expect(uploadBtn).toBeEnabled({ timeout: 10000 });

        // 5. Register API wait and click
        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('/documents') && (resp.status() === 200 || resp.status() === 201),
            { timeout: 10000 }
        );

        await uploadBtn.click();

        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }

    // async uploadDocument(filePath: string, category: string = 'General') {
    //     // 1. Ensure Documents tab in drawer is active
    //     await this.docsTabButton.click();

    //     // 2. Attach file
    //     const fileInput = this.page.locator('input[type="file"]').first();
    //     await fileInput.waitFor({ state: 'attached', timeout: 10000 });
    //     await fileInput.setInputFiles(filePath);

    //     // 3. Category selection (Match label or value dynamically)
    //     const categorySelect = this.page.locator('select').filter({ hasText: /general|contract|legal/i }).first();
    //     if (await categorySelect.isVisible()) {
    //         // Try selecting by label, lowercase value, or index
    //         try {
    //             await categorySelect.selectOption({ label: category });
    //         } catch {
    //             await categorySelect.selectOption(category.toLowerCase()).catch(() => {
    //                 // Fallback to second option if specific string fails
    //                 categorySelect.selectOption({ index: 1 });
    //             });
    //         }
    //     }

    //     // 4. Wait for the upload button to actually be enabled
    //     const uploadBtn = this.page.getByRole('button', { name: /^Upload$/i });
    //     await expect(uploadBtn).toBeEnabled({ timeout: 5000 });

    //     // 5. Register API wait and click
    //     const responsePromise = this.page.waitForResponse(
    //         (resp) => resp.url().includes('/documents') && (resp.status() === 200 || resp.status() === 201),
    //         { timeout: 10000 }
    //     );

    //     await uploadBtn.click();

    //     await responsePromise;
    //     await this.page.waitForLoadState('networkidle');
    // }

    async archiveFirstDocument() {
        const archiveBtn = this.page.locator('table').last().getByRole('button', { name: /archive/i }).first();
        await archiveBtn.scrollIntoViewIfNeeded();

        // 1. Set up response listener AND click in parallel with Promise.all
        await Promise.all([
            this.page.waitForResponse(
                (resp) => resp.url().includes('/documents') &&
                    (resp.status() === 200 || resp.status() === 204 || resp.status() === 202),
                { timeout: 10000 }
            ),
            archiveBtn.click({ force: true })
        ]);

        // 2. Allow React state re-render to complete
        await this.page.waitForLoadState('networkidle');
    }

    async archiveCurrentCase() {
        const archiveCaseBtn = this.page.getByRole('button', { name: /archive case/i });
        await archiveCaseBtn.waitFor({ state: 'visible' });
        await archiveCaseBtn.click({ force: true });
        await this.page.waitForLoadState('networkidle');
    }

    async clickEvidenceTab() {
        await this.evidenceTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.evidenceTab.click();
    }

    async clickWitnessesTab() {
        await this.witnessesTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.witnessesTab.click();
    }

    async addEvidence(type: string, detail: string) {
        await this.clickEvidenceTab();

        await this.addEvidenceButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.addEvidenceButton.click();

        // Scope to the evidence modal form
        const evidenceForm = this.page.locator('form');
        await evidenceForm.getByPlaceholder(/recording|documents|type/i).fill(type);
        await evidenceForm.getByPlaceholder(/evidence details|detail/i).fill(detail);

        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('/evidences') && (resp.status() === 200 || resp.status() === 201),
            { timeout: 10000 }
        );

        await evidenceForm.getByRole('button', { name: 'Add Evidence', exact: true }).click();
        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }

    async addWitness(
        name: string = 'Eye Witness',
        age: number = 35,
        phone: string = '0541112233',
        email: string = 'witness@example.com'
    ) {
        // 1. Switch tab
        await this.clickWitnessesTab();

        // 2. Open Modal
        await this.addWitnessButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.addWitnessButton.click();

        // 3. Target the open Witness Modal
        const modal = this.page.locator('div.fixed').filter({ hasText: 'Add New Witness' });
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        // 4. Get all inputs inside the modal form in order: [0] Name, [1] Age, [2] Phone, [3] Email
        const inputs = modal.locator('form input');

        await inputs.nth(0).fill(name);
        await inputs.nth(1).fill(age.toString());
        await inputs.nth(2).fill(phone);
        await inputs.nth(3).fill(email);

        // 5. Register network response listener BEFORE clicking submit
        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().toLowerCase().includes('witness') &&
                resp.request().method() === 'POST',
            { timeout: 10000 }
        );

        // 6. Click Submit
        await modal.getByRole('button', { name: 'Add Witness', exact: true }).click();

        // 7. Wait for response
        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }
}