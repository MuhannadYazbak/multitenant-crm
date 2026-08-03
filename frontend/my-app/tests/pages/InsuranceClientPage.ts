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
    readonly policiesTabButton: Locator;
    readonly notesTabButton: Locator;
    readonly drawerAuthorInput: Locator;
    readonly drawerNoteInput: Locator;
    readonly drawerAddNoteButton: Locator;
    readonly vehicleTab: Locator;
    readonly propertyTab: Locator;

    // 🆕 Vehicle Modal Locators
    readonly addVehicleButton: Locator;
    readonly vehiclePlateInput: Locator;
    readonly vehicleModelInput: Locator;
    readonly submitVehicleButton: Locator;

    // 🆕 Property Modal Locators
    readonly addPropertyButton: Locator;
    readonly propertyAddressInput: Locator;
    readonly propertyValueInput: Locator;
    readonly submitPropertyButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.page.on('dialog', async (dialog) => {
            try { await dialog.accept(); } catch { }
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

        // Drawer Tabs & Notes Form Controls
        this.policiesTabButton = this.page.getByRole('button', { name: /policies/i });
        this.notesTabButton = this.drawerContainer.getByRole('button', { name: /Notes/i });
        this.drawerAuthorInput = this.drawerContainer.getByPlaceholder('Author Name');
        this.drawerNoteInput = this.drawerContainer.getByPlaceholder('Type note details...');
        this.drawerAddNoteButton = this.drawerContainer.getByRole('button', { name: 'Post Note', exact: true });
        this.vehicleTab = this.page.getByRole('button', { name: /vehicles/i });
        this.propertyTab = this.page.getByRole('button', { name: /properties/i });

        // 🆕 Vehicle Locators
        this.addVehicleButton = page.locator('#addVehicleBtn');
        this.vehiclePlateInput = page.getByPlaceholder(/license plate|plate/i);
        this.vehicleModelInput = page.getByPlaceholder(/make|model|vehicle/i);
        this.submitVehicleButton = page.getByRole('button', { name: /add vehicle|save vehicle/i });

        // 🆕 Property Locators
        this.addPropertyButton = page.locator('#addPropertyBtn');
        this.propertyAddressInput = page.getByPlaceholder(/address|property location/i);
        this.propertyValueInput = page.getByPlaceholder(/value|estimated value/i);
        this.submitPropertyButton = page.getByRole('button', { name: /add property|save property/i });
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

    async clickVehiclesTab() {
        await this.vehicleTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.vehicleTab.click();
    }

    // 🆕 Helper: Add Vehicle
    async addVehicle(
        manufacturer: string,
        model: string,
        year: number | string,
        plateNo: string
    ) {
        // 1. Ensure Vehicles tab is active
        const vehiclesTab = this.page.getByRole('button', { name: /vehicles/i });
        if (await vehiclesTab.isVisible()) {
            await vehiclesTab.click();
        }

        // 2. Click "+ Add Vehicle" button on the page/tab
        const addVehicleBtn = this.page.getByRole('button', { name: /add vehicle|\+ vehicle/i });
        await addVehicleBtn.waitFor({ state: 'visible', timeout: 5000 });
        await addVehicleBtn.click();

        // 3. Scope to the modal using the exact title rendered in VehicleModal ("Add New Vehicle")
        const modal = this.page.locator('div.fixed, [role="dialog"]').filter({ hasText: 'Add New Vehicle' });
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        // 4. Fill form fields inside modal scope
        await modal.getByLabel('Manufacturer').or(modal.getByPlaceholder(/skoda|toyota/i)).fill(manufacturer);
        await modal.getByLabel('Model').or(modal.getByPlaceholder(/rapid|corolla/i)).fill(model);
        await modal.getByLabel('Year').or(modal.getByPlaceholder(/2017/i)).fill(String(year));
        await modal.getByLabel('Plate Number').or(modal.getByPlaceholder(/1122233/i)).fill(plateNo);

        // 5. Submit form
        const submitBtn = modal.getByRole('button', { name: 'Add Vehicle', exact: true });
        await submitBtn.click();

        // 6. Wait for modal to close / state to sync
        await modal.waitFor({ state: 'detached', timeout: 5000 });
        await this.page.waitForLoadState('networkidle');
    }

    async clickPropertiesTab() {
        await this.propertyTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.propertyTab.click();
    }

    // 🆕 Helper: Add Property
    async addProperty(type: string = 'Home', area: number | string = 120) {
        // 1. Ensure Properties tab is active if tabs are used
        const propertiesTab = this.page.getByRole('button', { name: /properties|property/i });
        if (await propertiesTab.isVisible()) {
            await propertiesTab.click();
        }

        // 2. Click "+ Add Property" button to open the modal
        const addPropertyBtn = this.page.getByRole('button', { name: /add property|\+ property/i });
        await addPropertyBtn.waitFor({ state: 'visible', timeout: 5000 });
        await addPropertyBtn.click();

        // 3. Scope strictly to the "Add New Property" modal wrapper
        const modal = this.page.locator('div.fixed, [role="dialog"]').filter({ hasText: 'Add New Property' });
        await modal.waitFor({ state: 'visible', timeout: 5000 });

        // 4. Fill 'Type' (e.g. Home, Office)
        await modal.getByLabel('Type').or(modal.getByPlaceholder(/home, office/i)).fill(type);

        // 5. Fill 'Area' (e.g. 120)
        await modal.getByLabel('Area').or(modal.getByPlaceholder(/property area/i)).fill(String(area));

        // 6. Submit form
        const submitBtn = modal.getByRole('button', { name: 'Add Property', exact: true });
        await submitBtn.click();

        // 7. Wait for modal to detach/close
        await modal.waitFor({ state: 'detached', timeout: 5000 });
        await this.page.waitForLoadState('networkidle');
    }
}