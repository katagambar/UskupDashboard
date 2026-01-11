import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3053',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before tests (reuse existing if running)
  webServer: {
    command: 'npm run dev:local -- -p 3053',
    url: 'http://localhost:3053',
    reuseExistingServer: true, // Always reuse if dev server is running
    timeout: 120 * 1000,
  },
})

