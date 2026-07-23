// frontend/my-app/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: [
  {
    command: 'uvicorn main:app --port 8000',
    cwd: '../../backend',
    port: 8000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes max
  },
  {
    command: 'npm run build && npm run start', // or 'npm run dev'
    cwd: '.',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes max
  },
],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});