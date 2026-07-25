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
    await this.toggleAddClientButton.waitFor({ state: "visible" });
    if (await this.submitClientButton.isHidden()) {
      await this.toggleAddClientButton.click();
      await this.submitClientButton.waitFor({ state: "visible", timeout: 10000 });
    }
  }

  async addClient(clientData: { name: string; phone: string; email: string; address: string }) {
    await this.nameInput.fill(clientData.name);
    await this.phoneInput.fill(clientData.phone);
    await this.emailInput.fill(clientData.email);
    await this.addressInput.fill(clientData.address);

    // Wait for button to be visible and click
    await this.submitClientButton.waitFor({ state: "visible" });
    await this.submitClientButton.click();
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
    return this.clientsTableRows.filter({ hasText: name }).first();
  }

  async deleteClientByName(name: string) {
    const row = this.getClientRowByName(name);

    // 1. Set up dialog handler
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    // 2. Wait for the DELETE API request to succeed AND click delete
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.request().method() === "DELETE" && res.ok()
      ),
      row.getByRole("button", { name: "Delete" }).click(),
    ]);
  }
}