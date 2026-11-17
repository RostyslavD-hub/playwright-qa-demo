import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: 'https://restful-booker.herokuapp.com' },
    },
    {
      name: 'desktop-chrome',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: 'https://www.saucedemo.com' },
    },
    {
      // Mobile runs only the smoke set: fast "is it alive" signal on small screens.
      name: 'mobile-safari',
      testDir: './tests/ui',
      grep: /@smoke/,
      use: { ...devices['iPhone 14'], baseURL: 'https://www.saucedemo.com' },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/ui',
      grep: /@smoke/,
      use: { ...devices['Pixel 7'], baseURL: 'https://www.saucedemo.com' },
    },
  ],
});
