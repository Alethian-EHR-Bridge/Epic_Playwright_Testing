const fs = require('fs');
const path = require('path');

// Read the config.json file
const configPath = path.join(__dirname, '../src/config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Generate SauceLabs config.yml content
function generateSauceConfig() {
  const sauceConfig = config.sauceLabs;
  const selectedBrowser = config.execution.browser;
  const browserConfig = config.availableBrowsers[selectedBrowser];
  const platformConfig = sauceConfig.availablePlatforms[sauceConfig.selectedPlatform];
  const envConfig = config.environments.sauceLabs;

  let yamlContent = `apiVersion: v1alpha
kind: playwright
sauce:
  region: ${sauceConfig.region}
  concurrency: ${envConfig.concurrency}
  metadata:
    tags:
      - e2e
      - atheal
      - automation
    build: "$BUILD_ID"
playwright:
  version: 1.52.0
  configFile: playwright.saucelabs.config.ts
rootDir: ./
suites:
`;

  // Generate suites for each test file with selected browser and platform
  let suiteIndex = 1;
  config.testSuites.forEach(testFile => {
    const testName = path.basename(testFile, '.spec.ts').replace('Page', '');
    yamlContent += `  - name: "${suiteIndex}. ${testName} Test - ${browserConfig.displayName} ${platformConfig.name}"
    platformName: "${platformConfig.name}"
    screenResolution: "${platformConfig.screenResolution}"
    testMatch: ["${testFile}"]
    params:
      browserName: "${selectedBrowser}"
      project: "${selectedBrowser}"
`;
    suiteIndex++;
  });

  yamlContent += `
artifacts:
  download:
    when: always
    match:
      - "playwright-report/**"
      - "allure-results/**"
      - "allure-report/**"
    directory: ./artifacts/

reporters:
  spotlight:
    enabled: true
`;

  return yamlContent;
}

// Write the generated config to .sauce/config.yml
const outputPath = path.join(__dirname, '../.sauce/config.yml');
const generatedConfig = generateSauceConfig();

// Ensure .sauce directory exists
const sauceDir = path.dirname(outputPath);
if (!fs.existsSync(sauceDir)) {
  fs.mkdirSync(sauceDir, { recursive: true });
}

fs.writeFileSync(outputPath, generatedConfig);
console.log('✅ SauceLabs config.yml generated successfully!');
console.log(`📁 Generated: ${outputPath}`);
console.log(`🧪 Total test suites: ${config.testSuites.length}`);
console.log(`🌐 Browser: ${config.availableBrowsers[config.execution.browser].displayName}`);
console.log(`🖥️  Platform: ${config.sauceLabs.availablePlatforms[config.sauceLabs.selectedPlatform].name}`);
