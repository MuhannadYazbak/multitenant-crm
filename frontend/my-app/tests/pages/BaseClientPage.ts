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

    // Navigation
    async goto(tenant: string, clientName: string) {
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);
        await this.page.locator("#clientName").waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading'),
            { timeout: 10000 }
        );
        await this.page.waitForLoadState('networkidle');
    }


    async addNote(content: string, author: string = 'Test Admin', isPinned: boolean = false) {
        await this.notesTabButton.click();
        await this.authorInput.fill(author);
        await this.noteInput.fill(content);

        if (isPinned) {
            await this.page.check('input[type="checkbox"]');
        }

        // Wrap click and response wait together so the listener is active BEFORE the click fires
        await Promise.all([
            this.page.waitForResponse(
                (resp) => resp.url().includes('notes') && (resp.status() === 200 || resp.status() === 201),
                { timeout: 10000 }
            ),
            this.addNoteButton.click()
        ]);

        // Give Next.js client state a brief moment to update UI DOM
        await this.page.waitForLoadState('networkidle');
    }

    async deleteFirstNote() {
        await this.notesTabButton.click();
        await this.notesList.getByRole('button', { name: '🗑️' }).first().click();
        await this.page.waitForLoadState('networkidle');
    }

    // --- SHARED DOCUMENTS ACTIONS ---
    async uploadDocument(filePath: string, category: string = 'General', title: string = 'Document Title') {
        // 1. Ensure the Documents tab is clicked and active
        await this.docsTabButton.click();

        // 2. Locate the file input, ensure attached
        const fileInput = this.page.locator('input[type="file"]').first();
        await fileInput.waitFor({ state: 'attached', timeout: 10000 });

        // 3. Attach file
        await fileInput.setInputFiles(filePath);

        // 4. Trigger React state binding updates
        await fileInput.dispatchEvent('input');
        await fileInput.dispatchEvent('change');
        await this.page.waitForTimeout(500);

        // 5. Fill document title/name if mandatory in form
        const titleInput = this.page.locator('form input[type="text"], div[role="dialog"] input[type="text"]').first();
        try {
            await titleInput.waitFor({ state: 'visible', timeout: 3000 });
            await titleInput.fill(title);
            await titleInput.dispatchEvent('input');
        } catch {
            // Optional field, safe to skip if not present
        }

        // 6. Handle category selection if present
        //if (category) {
        const categorySelect = this.page.locator('form select, div[role="dialog"] select').first();
        try {
            await categorySelect.waitFor({ state: 'visible', timeout: 3000 });
            await categorySelect.selectOption({ label: category }).catch(async () => {
                await categorySelect.selectOption(category);
            });
            await categorySelect.dispatchEvent('change');
        } catch {
            // Optional select, safe to skip if not present
        }
        // }

        // 7. Wait for the upload button to become enabled
        await expect(this.uploadDocButton).toBeEnabled({ timeout: 10000 });

        // 8. Set up API response promise & click upload
        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().includes('/documents') && (resp.status() === 200 || resp.status() === 201),
            { timeout: 10000 }
        );

        await this.uploadDocButton.click();
        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }


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