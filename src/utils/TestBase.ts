import { test as baseTest } from '@playwright/test';
import config from '../config/config.json';
import { AppLibrary } from '../library/AppLibrary';

type TestFixtures = {
  app: AppLibrary;
};

export const test = baseTest.extend<TestFixtures>({
  app: async ({ page }, use) => {
    // Always use the page provided by Playwright (works for both local and SauceLabs)
    const app = new AppLibrary();
    app.page = page; // Use the page provided by Playwright
    await app.page.goto(config.baseUrl, { waitUntil: 'networkidle' });
    await use(app);
    // Browser is managed by Playwright, no need to close manually
  }
});

export { expect } from '@playwright/test';
