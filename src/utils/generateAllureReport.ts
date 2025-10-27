import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  console.log("🔹 Generating Allure report after test execution...");

  try {
    execSync('npx allure generate allure-results --clean', { stdio: 'inherit' });
    execSync('npx allure open allure-report', { stdio: 'inherit' });
    console.log("✅ Allure report generated successfully!");
  } catch (error) {
    console.error("❌ Allure report generation failed:", error);
  }
}

export default globalTeardown;
