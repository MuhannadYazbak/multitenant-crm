// tests/pages/InsuranceClientPage.ts
import { Locator, expect } from '@playwright/test';
import { BaseClientPage } from './BaseClientPage';

export class InsuranceClientPage extends BaseClientPage {
    // Insurance-specific Locators
    readonly addPolicyButton: Locator;
    readonly policyNumberInput: Locator;
    readonly coverageAmountInput: Locator;
    readonly submitPolicyButton: Locator;

    readonly policiesTableRows: Locator;
    readonly drawerContainer: Locator;
    readonly drawerHeader: Locator;
    readonly drawerDeletePolicyButton: Locator;

    readonly policiesTabButton: Locator;
    readonly vehicleTab: Locator;
    readonly propertyTab: Locator;

    constructor(page: any) {
        super(page);

        // Header & Modal
        this.addPolicyButton = page.getByRole('button', { name: /add.*policy/i });
        this.policyNumberInput = page.locator('input[placeholder*="POL"], input[name="policyNumber"], input').first();
        this.coverageAmountInput = page.locator('input[type="number"], input[placeholder*="coverage"]').first();
        this.submitPolicyButton = page.getByRole('button', { name: /create|save|add/i }).last();

        // Table & Drawer
        this.policiesTableRows = page.locator('table tbody tr');
        this.drawerContainer = page.locator('div.fixed.inset-0, [role="dialog"]').last();
        this.drawerHeader = this.drawerContainer.locator('h2');
        this.drawerDeletePolicyButton = this.drawerContainer.getByRole('button', { name: /delete/i });

        // Specialized Tabs
        this.policiesTabButton = page.getByRole('button', { name: /policies/i });
        this.vehicleTab = page.getByRole('button', { name: /vehicles/i });
        this.propertyTab = page.getByRole('button', { name: /properties/i });
    }

    async addDrawerNote(content: string, author: string = 'Insurance Agent') {
        await this.addNote(content, author);
    }

    async clickPoliciesTab() {
        await this.policiesTabButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.policiesTabButton.click();
    }

    async createPolicy(policyNumber: string, coverageAmount: string) {
        await this.clickPoliciesTab();
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

    async deletePolicy() {
        await this.drawerDeletePolicyButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Vehicle and Property methods...
    async addVehicle(manufacturer: string, model: string, year: number | string, plateNo: string) {
        const vehiclesTab = this.page.getByRole('button', { name: /vehicles/i });
        if (await vehiclesTab.isVisible()) {
            await vehiclesTab.click();
        }

        const addVehicleBtn = this.page.getByRole('button', { name: /add vehicle|\+ vehicle/i });
        await addVehicleBtn.waitFor({ state: 'visible', timeout: 5000 });
        await addVehicleBtn.click();

        const modal = this.page.locator('div.fixed, [role="dialog"]').filter({ hasText: 'Add New Vehicle' });
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        await modal.getByLabel('Manufacturer').or(modal.getByPlaceholder(/skoda|toyota/i)).fill(manufacturer);
        await modal.getByLabel('Model').or(modal.getByPlaceholder(/rapid|corolla/i)).fill(model);
        await modal.getByLabel('Year').or(modal.getByPlaceholder(/2017/i)).fill(String(year));
        await modal.getByLabel('Plate Number').or(modal.getByPlaceholder(/1122233/i)).fill(plateNo);

        const submitBtn = modal.getByRole('button', { name: 'Add Vehicle', exact: true });
        await submitBtn.click();
        await modal.waitFor({ state: 'detached', timeout: 5000 });
        await this.page.waitForLoadState('networkidle');
    }

    async addProperty(type: string = 'Home', area: number | string = 120) {
        const propertiesTab = this.page.getByRole('button', { name: /properties|property/i });
        if (await propertiesTab.isVisible()) {
            await propertiesTab.click();
        }

        const addPropertyBtn = this.page.getByRole('button', { name: /add property|\+ property/i });
        await addPropertyBtn.waitFor({ state: 'visible', timeout: 5000 });
        await addPropertyBtn.click();

        const modal = this.page.locator('div.fixed, [role="dialog"]').filter({ hasText: 'Add New Property' });
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        await modal.getByLabel('Type').or(modal.getByPlaceholder(/home, office/i)).fill(type);
        await modal.getByLabel('Area').or(modal.getByPlaceholder(/property area/i)).fill(String(area));

        const submitBtn = modal.getByRole('button', { name: 'Add Property', exact: true });
        await submitBtn.click();
        await modal.waitFor({ state: 'detached', timeout: 5000 });
        await this.page.waitForLoadState('networkidle');
    }
}