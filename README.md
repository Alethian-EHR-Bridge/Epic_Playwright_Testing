# Atheal Test Automation Framework

A simple, clean Playwright-based test automation framework designed for single browser execution with easy environment switching between local and SauceLabs cloud testing.

## 📁 Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   │   └── config.json   # Test environment and SauceLabs configuration
│   ├── library/          # Common actions and custom Playwright wrappers
│   │   └── AppLibrary.ts # Core library functions
│   ├── pages/            # Page Object Model classes
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── HeaderPage.ts
│   │   └── PatientDetailsPage.ts
│   ├── tests/            # Test specifications
│   │   ├── LoginPage.spec.ts
│   │   ├── DashboardPage.spec.ts
│   │   ├── PatientDetailsPage.spec.ts
│   │   └── ReportStatusFilter.spec.ts
│   └── utils/            # Utilities and test base
│       ├── TestBase.ts   # Test setup and fixtures
│       └── generateAllureReport.ts
├── scripts/              # Configuration and utility scripts
│   ├── configureSauce.js # SauceLabs configuration utility
│   └── generateSauceConfig.js # Generate SauceLabs YAML config
├── playwright.config.ts  # Local Playwright configuration
├── playwright.saucelabs.config.ts # SauceLabs Playwright configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the framework
The framework uses a simple configuration approach. View current settings:
```bash
npm run config
```

Set your environment and browser:
```bash
# Set environment (local or sauceLabs)
npm run config:env local

# Set browser (chromium, firefox, webkit)
npm run config:browser chromium

# For SauceLabs: set platform and region
npm run config:platform windows
npm run config:region eu-central-1
```

Edit `src/config/config.json` for base URL and credentials:
```json
{
  "baseUrl": "https://your-app-url/login",
  "execution": {
    "environment": "local",
    "browser": "chromium"
  },
  "credentials": {
    "email": "your-email@example.com",
    "password": "your-password"
  }
}
```

### 3. Run tests
The framework runs tests with a single browser at a time based on your configuration:

```bash
# Run tests locally (uses current browser setting)
npm run test:local

# Run tests on SauceLabs (uses current browser and platform)
npm run test:sauce

# Run specific test file
npx playwright test src/tests/LoginPage.spec.ts

# Run with UI mode (local only)
npx playwright test --ui
```

### 4. Generate and view reports
```bash
# Clean previous results
npm run clean

# Generate Allure report
npm run generate-report

# Open Allure report
npm run open-report

# Run tests and generate report in one command
npm run test:report
```

## 🛠️ Framework Configuration

### Simple Configuration Management
The framework uses a centralized configuration approach with easy-to-use commands:

```bash
# View current configuration
npm run config

# Set environment (local or sauceLabs)
npm run config:env local
npm run config:env sauceLabs

# Set browser (chromium, firefox, webkit)
npm run config:browser chromium
npm run config:browser firefox
npm run config:browser webkit

# Set SauceLabs platform (windows or macos)
npm run config:platform windows
npm run config:platform macos

# Set SauceLabs region
npm run config:region us-west-1
npm run config:region eu-central-1

# Show help
npm run config:help
```

### Configuration Structure
All settings are stored in `src/config/config.json`:

```json
{
  "execution": {
    "environment": "local",    // local or sauceLabs
    "browser": "chromium"      // chromium, firefox, webkit
  },
  "availableBrowsers": {
    "chromium": { "displayName": "Chrome", "device": "Desktop Chrome" },
    "firefox": { "displayName": "Firefox", "device": "Desktop Firefox" },
    "webkit": { "displayName": "Safari", "device": "Desktop Safari" }
  },
  "sauceLabs": {
    "region": "eu-central-1",
    "selectedPlatform": "windows",
    "availablePlatforms": {
      "windows": { "name": "Windows 11", "screenResolution": "1440x900" },
      "macos": { "name": "macOS 12", "screenResolution": "1440x900" }
    }
  }
}
```

## 🚀 Quick Start Examples

### Example 1: Run tests locally with Chrome
```bash
npm run config:env local
npm run config:browser chromium
npm run test:local
```

### Example 2: Run tests on SauceLabs with Firefox on Windows
```bash
npm run config:env sauceLabs
npm run config:browser firefox
npm run config:platform windows
npm run config:region eu-central-1
npm run test:sauce
```

### Example 3: Switch to Safari and run specific test
```bash
npm run config:browser webkit
npx playwright test src/tests/LoginPage.spec.ts
```

## 🧪 Available Test Scripts

| Command | Description |
|---------|-------------|
| `npm run test` | Run tests with current configuration |
| `npm run test:local` | Set environment to local and run tests |
| `npm run test:sauce` | Set environment to SauceLabs and run tests |
| `npm run clean` | Clean all test artifacts and reports |
| `npm run generate-report` | Generate Allure report |
| `npm run open-report` | Open Allure report |
| `npm run test:report` | Run tests and generate report |
| `npm run config` | Show current framework configuration |
| `npm run config:env <env>` | Set environment (local/sauceLabs) |
| `npm run config:browser <browser>` | Set browser (chromium/firefox/webkit) |
| `npm run config:platform <platform>` | Set SauceLabs platform (windows/macos) |
| `npm run config:region <region>` | Set SauceLabs region |
| `npm run config:help` | Show configuration help |

## 🐞 Troubleshooting

### Common Issues
- **Credentials**: Ensure credentials in `config.json` are correct
- **Browser installation**: Run `npx playwright install` to install browser binaries
- **Debugging**: Run tests in headed mode with `npx playwright test --headed`
- **SauceLabs**: Verify your SauceLabs credentials are set in environment variables

### Debugging Tips
```bash
# Run with debug mode
DEBUG=pw:api npx playwright test

# Run specific test with trace
npx playwright test --trace on src/tests/LoginPage.spec.ts

# Run with browser visible
npx playwright test --headed --slowMo=1000
```

## 📚 References
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [SauceLabs Documentation](https://docs.saucelabs.com/)
- [Allure Reporting](https://docs.qameta.io/allure/)

---
Feel free to reach out if you need help or want to extend the framework!