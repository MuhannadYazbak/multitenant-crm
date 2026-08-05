// frontend/my-app/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests",
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: [
    {
      // Local Windows uses its local .venv, Linux CI uses globally installed uvicorn
      command: process.platform === 'win32'
        ? '.venv\\Scripts\\uvicorn main:app --port 8000'
        : 'uvicorn main:app --port 8000',
      cwd: '../../backend',
      port: 8000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run build && npm run start',
      cwd: '.',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});