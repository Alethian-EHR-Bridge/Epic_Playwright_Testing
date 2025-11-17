
import { defineConfig, devices } from '@playwright/test';
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

// Determine execution environment
const isSauceLabs = config.execution.environment === 'sauceLabs' || !!process.env.SAUCE_VM;
const selectedBrowser = config.execution.browser;
const browserConfig = config.availableBrowsers[selectedBrowser];
const envConfig = config.environments[config.execution.environment];

// Configure reporter based on environment
let reporter: any[] = [
  ['list']
];

// Add custom JSON and Text reporter for all environments
reporter.push(['./src/utils/customReporter.ts', { outputDir: path.join(__dirname, 'test-reports') }]);

if (isSauceLabs) {
  // SauceLabs specific reporter configuration - only use basic reporters
  reporter.push(['html', {
    outputFolder: '__assets__/html-report/',
    attachmentsBaseURL: './',
    open: 'never'
  }]);
  reporter.push(['junit', { outputFile: '__assets__/junit.xml' }]);
} else {
  // Local development reporter configuration
  reporter.push(['allure-playwright']);
  reporter.push(['html', {
    outputFolder: 'playwright-report',
    open: 'always'
  }]);
}

export default defineConfig({
  testDir: './src/tests',
  timeout: envConfig.timeout,
  retries: envConfig.retries,
  fullyParallel: envConfig.fullyParallel,
  workers: envConfig.workers,
  reporter,
  use: {
    headless: envConfig.headless,
    viewport: isSauceLabs ? { width: 1440, height: 900 } : null,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: browserConfig.name,
      use: {
        ...devices[browserConfig.device],
        browserName: browserConfig.name
      },
    }
  ],
  // globalTeardown: './src/utils/generateAllureReport.ts'
});
