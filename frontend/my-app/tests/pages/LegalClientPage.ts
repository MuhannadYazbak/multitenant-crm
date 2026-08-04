// tests/pages/LegalClientPage.ts
import { Locator, expect } from '@playwright/test';
import { BaseClientPage } from './BaseClientPage';

export class LegalClientPage extends BaseClientPage {
    readonly addCaseButton: Locator;
    readonly caseNumberInput: Locator;
    readonly caseTypeSelect: Locator;
    readonly courtInput: Locator;
    readonly submitCaseButton: Locator;

    readonly casesTableRows: Locator;
    readonly drawerContainer: Locator;
    readonly drawerHeader: Locator;
    readonly drawerCloseButton: Locator;
    readonly drawerArchiveCaseButton: Locator;

    readonly casesTab: Locator;
    readonly evidenceTab: Locator;
    readonly witnessesTab: Locator;

    readonly addEvidenceButton: Locator;
    readonly addWitnessButton: Locator;

    constructor(page: any) {
        super(page);

        // Case Form Locators
        this.addCaseButton = page.getByRole('button', { name: '+ Add New Case' });
        this.caseNumberInput = page.getByPlaceholder('e.g. CAS-2026-001');
        this.caseTypeSelect = page.locator('select[name="case_type"], select').first();
        this.courtInput = page.getByPlaceholder('e.g. Haifa District Court');
        this.submitCaseButton = page.getByRole('button', { name: 'Create Case' });

        // Table & Drawer
        this.casesTableRows = page.locator('table tbody tr');
        this.drawerContainer = page.locator('div.fixed.inset-0, [role="dialog"]').last();
        this.drawerHeader = page.locator('.fixed.inset-0 h2');
        this.drawerCloseButton = page.locator('.fixed.inset-0').getByRole('button', { name: '✕' });
        this.drawerArchiveCaseButton = page.getByRole('button', { name: '🗑️ Archive Case' });

        // Legal-specific Tabs
        this.casesTab = page.getByRole('button', { name: /cases/i });
        this.evidenceTab = page.getByRole('button', { name: /evidence/i });
        this.witnessesTab = page.getByRole('button', { name: /witness/i });

        this.addEvidenceButton = page.locator('#addEvidenceBtn');
        this.addWitnessButton = page.locator('#addWitnessBtn');
    }

    async clickCasesTab() {
        await this.casesTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.casesTab.click();
    }

    async createCase(caseNumber: string, caseType = 'Civil Litigation', court = 'Haifa District Court') {
        await this.clickCasesTab();

        await this.addCaseButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.addCaseButton.click();

        const caseModal = this.page.locator('div.fixed, [role="dialog"]').filter({ hasText: 'Create Case' });
        await caseModal.getByPlaceholder('e.g. CAS-2026-001').fill(caseNumber);

        const select = caseModal.locator('select').first();
        await select.selectOption({ label: caseType }).catch(async () => {
            await select.selectOption(caseType);
        });

        await caseModal.getByPlaceholder('e.g. Haifa District Court').fill(court);
        await caseModal.getByRole('button', { name: 'Create Case' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async openCaseDrawer(caseNumber: string) {
        const row = this.casesTableRows.filter({ hasText: caseNumber });
        await row.getByRole('button', { name: 'Manage Case →' }).click();
        await this.page.locator('h2, h3').filter({ hasText: caseNumber }).waitFor({ state: 'visible', timeout: 10000 });
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
        await this.clickWitnessesTab();

        await this.addWitnessButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.addWitnessButton.click();

        const modal = this.page.locator('div.fixed').filter({ hasText: 'Add New Witness' });
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        const inputs = modal.locator('form input');
        await inputs.nth(0).fill(name);
        await inputs.nth(1).fill(age.toString());
        await inputs.nth(2).fill(phone);
        await inputs.nth(3).fill(email);

        const responsePromise = this.page.waitForResponse(
            (resp) => resp.url().toLowerCase().includes('witness') &&
                resp.request().method() === 'POST',
            { timeout: 10000 }
        );

        await modal.getByRole('button', { name: 'Add Witness', exact: true }).click();
        await responsePromise;
        await this.page.waitForLoadState('networkidle');
    }
}