import { Page, Locator, expect } from '@playwright/test';

export class GeneralClientPage {
    readonly page: Page;

    // Tabs
    readonly notesTabButton: Locator;
    readonly docsTabButton: Locator;
    readonly billingTabButton: Locator;

    // Notes Tab
    readonly authorInput: Locator;
    readonly noteInput: Locator;
    readonly addNoteButton: Locator;
    readonly notesList: Locator;

    constructor(page: Page) {
        this.page = page;

        this.page.on('dialog', async (dialog) => {
            try { await dialog.accept(); } catch {}
        });

        // Tabs
        this.notesTabButton = page.getByRole('button', { name: /Notes/i });
        this.docsTabButton = page.getByRole('button', { name: /Documents/i });
        this.billingTabButton = page.getByRole('button', { name: /Billing/i });

        // Notes Form Locators matching TabsSection.tsx
        this.authorInput = page.getByPlaceholder('Author Name');
        this.noteInput = page.getByPlaceholder('Type note details...');
        this.addNoteButton = page.getByRole('button', { name: 'Post Note', exact: true });
        this.notesList = page.locator('#noteslist');
    }

    async goto(tenant: string, clientName: string) {
        await this.page.goto(`/${tenant}/mypage/${encodeURIComponent(clientName)}`);
        await this.page.waitForFunction(
            () => !document.body.innerText.includes('Loading profile details...'),
            { timeout: 10000 }
        );
        await this.page.waitForLoadState('networkidle');
    }

    async addNote(content: string, author: string = 'Test Admin') {
        await this.notesTabButton.click();
        await this.authorInput.fill(author);
        await this.noteInput.fill(content);
        await this.addNoteButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteFirstNote() {
        await this.notesTabButton.click();
        await this.notesList.getByRole('button', { name: '🗑️' }).first().click();
        await this.page.waitForLoadState('networkidle');
    }
}