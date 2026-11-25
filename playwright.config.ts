import { defineConfig, devices } from '@playwright/test';

// port 4321 が別の作業で埋まっているときは E2E_PORT で変える（CI は既定の 4321 のまま）
const port = Number(process.env.E2E_PORT ?? 4321);
// E2E_BASE_URL=https://griftai.org/ で、公開中のサイトを同じ試験で照合する（手元の preview は立てない）
const externalBaseURL = process.env.E2E_BASE_URL;
const baseURL = externalBaseURL ?? `http://127.0.0.1:${port}/`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  webServer: externalBaseURL
    ? undefined
    : {
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
