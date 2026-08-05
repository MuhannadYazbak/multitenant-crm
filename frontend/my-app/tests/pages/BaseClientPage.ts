// tests/pages/BaseClientPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class BaseClientPage {
    readonly page: Page;

    // Shared TabsSection Locators
    readonly notesTabButton: Locator;
    readonly docsTabButton: Locator;
    readonly billingTabButton: Locator;

    // Notes Locators
    readonly authorInput: Locator;
    readonly noteInput: Locator;
    readonly addNoteButton: Locator;
    readonly notesList: Locator;

    // Documents Locators
    readonly fileInput: Locator;
    readonly categorySelect: Locator;
    readonly uploadDocButton: Locator;
    readonly toggleArchivedDocsButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Automatically handle alert/confirm dialogs
        this.page.on('dialog', async (dialog) => {
            try { await dialog.accept(); } catch { }
        });

        // Tabs Section Controls
        this.notesTabButton = page.getByRole('button', { name: /^📝 Notes$/i });
        this.docsTabButton = page.getByRole('button', { name: /^📁 Documents$/i });
        this.billingTabButton = page.getByRole('button', { name: /^💳 Billing Ledger$/i });

        // Notes Form Locators
        this.authorInput = page.getByPlaceholder('Author Name');
        this.noteInput = page.getByPlaceholder('Type note details...');
        this.addNoteButton = page.getByRole('button', { name: 'Post Note', exact: true });
        this.notesList = page.locator('#noteslist');

        // Docs Locators
        this.fileInput = page.locator('input[type="file"]');
        this.categorySelect = page.locator('form select').first();
        this.uploadDocButton = page.getByRole('button', { name: /^Upload$/i });
        this.toggleArchivedDocsButton = page.locator('#archive/unarchive');
    }

    // --- NAVIGATION ---
    async goto(tenant: string, clientName: string) {
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);
        await this.page.locator('h1, h2', { hasText: clientName }).waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading'),
            { timeout: 10000 }
        );
        await this.page.waitForLoadState('networkidle');
    }

    // --- SHARED NOTES ACTIONS ---
    async addNote(content: string, author: string = 'Test Admin', isPinned: boolean = false) {
        await this.notesTabButton.click();
        await this.authorInput.fill(author);
        await this.noteInput.fill(content);
        if (isPinned) {
            await this.page.check('input[type="checkbox"]');
        }

        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('/notes') && (resp.status() === 200 || resp.status() === 201)
        );

        await this.addNoteButton.click();
        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }

    async deleteFirstNote() {
        await this.notesTabButton.click();
        await this.notesList.getByRole('button', { name: '🗑️' }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    // --- SHARED DOCUMENTS ACTIONS ---

    // tests/pages/BaseClientPage.ts

    // pages/BaseClientPage.ts

    async uploadDocument(filePath: string) {
        // 1. Set input files on the file locator
        await this.fileInput.setInputFiles(filePath);

        // 2. Dispatch change event to guarantee React/Vue state updates in headless CI
        await this.fileInput.dispatchEvent('change');
        await this.fileInput.dispatchEvent('input');

        // 3. Wait for the upload button to become enabled
        await expect(this.uploadDocButton).toBeEnabled({ timeout: 10000 });

        // 4. Trigger upload
        const responsePromise = this.page.waitForResponse(
            (res) => res.url().includes('/documents') && res.status() === 200
        );
        await this.uploadDocButton.click();
        await responsePromise;
    }

    // async uploadDocument(filePath: string, category: string = 'General') {
    //     // 1. Ensure the Documents tab is clicked and active
    //     await this.docsTabButton.click();

    //     // 2. Locate the file input, ensure attached and visible/ready
    //     const fileInput = this.page.locator('input[type="file"]').first();
    //     await fileInput.waitFor({ state: 'attached', timeout: 10000 });

    //     // 3. Attach file and dispatch change event to trigger React state (setSelectedFile)
    //     await fileInput.setInputFiles(filePath);
    //     await fileInput.dispatchEvent('change');

    //     // 4. Handle category selection if present
    //     if (category) {
    //         const categorySelect = this.page.locator('form select, div[role="dialog"] select').first();
    //         if (await categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    //             await categorySelect.selectOption({ label: category }).catch(async () => {
    //                 await categorySelect.selectOption(category);
    //             });
    //         }
    //     }

    //     // 5. Wait for the upload button to become enabled
    //     await expect(this.uploadDocButton).toBeEnabled({ timeout: 10000 });

    //     // 6. Set up API response promise & click upload
    //     const responsePromise = this.page.waitForResponse(
    //         (resp) => resp.url().includes('/documents') && (resp.status() === 200 || resp.status() === 201),
    //         { timeout: 10000 }
    //     );

    //     await this.uploadDocButton.click();
    //     await responsePromise;
    //     await this.page.waitForLoadState('networkidle');
    // }

    // async uploadDocument(filePath: string, category: string = 'General') {
    //     await this.docsTabButton.click();

    //     await this.fileInput.waitFor({ state: 'attached', timeout: 10000 });
    //     await this.fileInput.setInputFiles(filePath);

    //     if (category && await this.categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    //         await this.categorySelect.selectOption({ label: category }).catch(async () => {
    //             await this.categorySelect.selectOption(category);
    //         });
    //     }

    //     await expect(this.uploadDocButton).toBeEnabled({ timeout: 10000 });

    //     const responsePromise = this.page.waitForResponse(
    //         (resp) => resp.url().includes('/documents') && (resp.status() === 200 || resp.status() === 201),
    //         { timeout: 10000 }
    //     );

    //     await this.uploadDocButton.click();
    //     await responsePromise;
    //     await this.page.waitForLoadState('networkidle');
    // }

    async archiveFirstDocument() {
        await this.docsTabButton.click();
        const archiveBtn = this.page.locator('table').last().getByRole('button', { name: /archive/i }).first();
        await archiveBtn.scrollIntoViewIfNeeded();

        await Promise.all([
            this.page.waitForResponse(
                (resp) => resp.url().includes('/documents') &&
                    (resp.status() === 200 || resp.status() === 204 || resp.status() === 202),
                { timeout: 10000 }
            ),
            archiveBtn.click({ force: true })
        ]);

        await this.page.waitForLoadState('networkidle');
    }

    // --- SHARED BILLING ACTIONS ---
    async addBillingEntry(description: string, hours: string, rate: string = '200', isPaid: boolean = false) {
        await this.billingTabButton.click();

        await this.page.fill('input[placeholder="Service description"]', description);
        await this.page.fill('input[placeholder="Hours"]', hours);
        await this.page.fill('input[placeholder="Hourly Rate ($)"]', rate);

        if (isPaid) {
            await this.page.check('input[type="checkbox"]');
        }

        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('/billing') && (resp.status() === 200 || resp.status() === 201)
        );

        await this.page.getByRole('button', { name: /Log Time/i }).click();
        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }
}