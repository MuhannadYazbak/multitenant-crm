import { Locator, Page } from "@playwright/test";

export class TenantDashboardPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly toggleAddClientButton: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly addCustomFieldButton: Locator;
  readonly submitClientButton: Locator;
  readonly clientsTableRows: Locator;

  constructor(page: Page) {
    this.page = page;

    // Search and Form Toggle
    this.searchInput = page.getByPlaceholder("Search by name, email, phone, or custom field...");
    this.toggleAddClientButton = page.getByRole("button", { name: /➕ Add Client|✕ Close/i });

    // Client Form Locators
    this.nameInput = page.getByPlaceholder("Enter Your Name");
    this.phoneInput = page.getByPlaceholder("Enter Your Phone Number");
    this.emailInput = page.getByPlaceholder("Enter Your Email");
    this.addressInput = page.getByPlaceholder("Enter Your Address");
    this.addCustomFieldButton = page.getByRole("button", { name: "+ Add Field" });
    this.submitClientButton = page.getByRole("button", { name: "Send" });

    // Table Locators
    this.clientsTableRows = page.locator("tbody tr");
  }

  async openAddClientForm() {
    if (await this.submitClientButton.isHidden()) {
      await this.toggleAddClientButton.click();
    }
  }

  async addClient(clientData: { name: string; phone: string; email: string; address: string }) {
    // 1. Open the form if it's closed
    const addButton = this.page.getByRole("button", { name: /Add Client/i });
    if (await addButton.isVisible()) {
      await addButton.click();
    }

    // 2. Fill the inputs
    await this.page.getByPlaceholder("Enter Your Name").fill(clientData.name);
    await this.page.getByPlaceholder("Enter Your Phone Number").fill(clientData.phone);
    await this.page.getByPlaceholder("Enter Your Email").fill(clientData.email);
    await this.page.getByPlaceholder("Enter Your Address").fill(clientData.address);

    // 3. Click Send button
    await this.page.getByRole("button", { name: "Send" }).click();
  }

  async addCustomField(key: string, value: string) {
    await this.addCustomFieldButton.click();

    // Target the newly appended inputs
    const keyInput = this.page.getByPlaceholder("Field Name (e.g. VAT)").last();
    const valueInput = this.page.getByPlaceholder("Value").last();

    await keyInput.fill(key);
    await valueInput.fill(value);
  }

  async searchClient(query: string) {
    await this.searchInput.fill(query);
  }

  getClientRowByName(name: string): Locator {
    return this.clientsTableRows.filter({ hasText: name });
  }

  async deleteClientByName(name: string) {
    const row = this.getClientRowByName(name);

    // Auto-accept window confirm dialog
    this.page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Delete" }).click();
  }
}