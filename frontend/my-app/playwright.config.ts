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
      // Pass the test DB URL directly to the backend webServer invocation
      command: 'set "DATABASE_URL=postgresql://postgres:My%40postgre@localhost:5432/saas_mvp_test" && cd ../../backend && .venv\\Scripts\\python.exe -m uvicorn main:app --port 8000',
      url: "http://localhost:8000/docs",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});