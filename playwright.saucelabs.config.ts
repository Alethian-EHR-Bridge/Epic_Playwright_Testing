import { defineConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available, continue without it
}

// Read configuration from config.json
const configPath = path.join(__dirname, 'src/config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Get selected browser and environment configuration
const selectedBrowser = config.execution.browser;
const browserConfig = config.availableBrowsers[selectedBrowser];
const envConfig = config.environments.sauceLabs;

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',
  timeout: envConfig.timeout,
  retries: envConfig.retries,
  fullyParallel: envConfig.fullyParallel,
  workers: envConfig.workers,
  reporter: [
    ['list'],
    ['html', {
      outputFolder: '__assets__/html-report/',
      attachmentsBaseURL: './',
      open: 'never'
    }],
    ['junit', { outputFile: '__assets__/junit.xml' }]
  ],
  use: {
    headless: envConfig.headless,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: browserConfig.name,
      use: {
        browserName: browserConfig.name
      },
      testMatch: '**/*.spec.ts'
    }
  ],
});
