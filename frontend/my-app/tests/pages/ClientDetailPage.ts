import { Locator, Page } from "@playwright/test";

export class ClientDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly editClientButton: Locator;
  readonly nameHeading: Locator;
  readonly phoneText: Locator;
  readonly emailText: Locator;
  readonly addressText: Locator;

  // Edit Form Locators
  readonly editNameInput: Locator;
  readonly editPhoneInput: Locator;
  readonly editEmailInput: Locator;
  readonly editAddressInput: Locator;
  readonly newFieldKeyInput: Locator;
  readonly newFieldValueInput: Locator;
  readonly addCustomFieldButton: Locator;
  readonly saveChangesButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Read View Locators
    this.backButton = page.getByRole("button", { name: "← Back" });
    this.editClientButton = page.getByRole("button", { name: /✏️ Edit Client|Cancel/i });
    this.nameHeading = page.locator("h2");
    this.phoneText = page.locator("p", { hasText: "Phone:" });
    this.emailText = page.locator("p", { hasText: "Email:" });
    this.addressText = page.locator("p", { hasText: "Address:" });

    // Edit Form Locators
    this.editNameInput = page.locator('form input[type="text"]').nth(0);
    this.editPhoneInput = page.locator('form input[type="text"]').nth(1);
    this.editEmailInput = page.locator('form input[type="email"]');
    this.editAddressInput = page.locator('form input[type="text"]').nth(2);
    this.newFieldKeyInput = page.getByPlaceholder("Field Name");
    this.newFieldValueInput = page.getByPlaceholder("Value");
    this.addCustomFieldButton = page.getByRole("button", { name: "+Add" });
    this.saveChangesButton = page.getByRole("button", { name: /Save Changes|Saving.../i });
  }

  async toggleEditMode() {
    await this.editClientButton.click();
  }

  async updateProfile(data: { name?: string; phone?: string; email?: string; address?: string }) {
    if (data.name) await this.editNameInput.fill(data.name);
    if (data.phone) await this.editPhoneInput.fill(data.phone);
    if (data.email) await this.editEmailInput.fill(data.email);
    if (data.address) await this.editAddressInput.fill(data.address);
  }

  async addCustomField(key: string, value: string) {
    await this.newFieldKeyInput.fill(key);
    await this.newFieldValueInput.fill(value);
    await this.addCustomFieldButton.click();
  }

  async saveChanges() {
    await this.saveChangesButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }
}