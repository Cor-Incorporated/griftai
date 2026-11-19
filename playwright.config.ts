import { defineConfig, devices } from '@playwright/test';

// port 4321 が別の作業で埋まっているときは E2E_PORT で変える（CI は既定の 4321 のまま）
const port = Number(process.env.E2E_PORT ?? 4321);
const baseURL = `http://127.0.0.1:${port}/`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  webServer: {
    command: `npm run preview -- --port ${port} --host 127.0.0.1`,
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
