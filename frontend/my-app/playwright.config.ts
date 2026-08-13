// frontend/my-app/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests",
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  use: {
    // Explicit 127.0.0.1 avoids IPv6 localhost resolution hangs in Linux CI
    baseURL: "http://127.0.0.1:3000",
  },
  webServer: [
    {
      // 1. Backend Server
      command: process.platform === 'win32'
        ? '.venv\\Scripts\\uvicorn main:app --host 127.0.0.1 --port 8000'
        : 'uvicorn main:app --host 127.0.0.1 --port 8000',
      cwd: '../../backend',
      url: 'http://127.0.0.1:8000/docs', // Polls endpoint directly instead of port
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      // 2. Next.js Frontend Server
      // In CI: Runs pre-built server. Locally: Runs dev server.
      command: process.env.CI ? 'npm run start' : 'npm run dev',
      cwd: '.',
      url: 'http://127.0.0.1:3000',
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