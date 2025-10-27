# SauceLabs Integration Setup Guide

This guide will help you set up and run your Playwright tests on SauceLabs cloud platform.

## Prerequisites

1. **SauceLabs Account**: Sign up at [saucelabs.com](https://saucelabs.com)
2. **Node.js**: Version 18 or higher
3. **Existing Playwright Tests**: Your tests should already be working locally

## Setup Steps

### 1. Configure SauceLabs Credentials

#### Option A: Using saucectl configure (Recommended)
```bash
npm run sauce:configure
```
This will prompt you for your SauceLabs username and access key.

#### Option B: Manual Environment Variables
Create a `.env` file in your project root:
```bash
cp .env.example .env
```

Edit `.env` and add your SauceLabs credentials:
```
SAUCE_USERNAME=your_sauce_username
SAUCE_ACCESS_KEY=your_sauce_access_key
```

**Find your credentials:**
- Log into SauceLabs
- Go to Account → User Settings
- Copy your Username and Access Key

### 2. Test Local Setup
First, ensure your tests work locally:
```bash
npm run test:local
```

### 3. Run Tests on SauceLabs

#### Run on US West region (default):
```bash
npm run test:sauce
```

#### Run on EU Central region:
```bash
npm run test:sauce:eu
```

#### Run on specific US region:
```bash
npm run test:sauce:us
```

## Configuration Files

### `.sauce/config.yml`
Main SauceLabs configuration file that defines:
- Test suites and browser combinations
- Platform configurations (Windows, macOS)
- Artifact collection settings
- Concurrency limits

### `playwright.config.ts`
Updated to support both local and SauceLabs environments:
- Automatic detection of SauceLabs environment
- Different reporter configurations
- Optimized settings for cloud execution

## Available Test Suites

The configuration includes these test combinations:
- **Chrome on Windows 11** (1440x900)
- **Firefox on Windows 11** (1440x900)  
- **Chrome on macOS 12** (1440x900)
- **Safari on macOS 12** (1440x900)

## CI/CD Integration

### GitHub Actions
A workflow file is included at `.github/workflows/saucelabs-tests.yml` that:
- Runs tests on every push/PR to main/develop branches
- Allows manual triggering
- Uploads test artifacts
- Requires `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` secrets

**To set up GitHub secrets:**
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` secrets

### Other CI Platforms
SauceLabs supports integration with:
- Jenkins
- Azure DevOps
- GitLab CI
- CircleCI
- And more

## Viewing Results

### SauceLabs Dashboard
1. Log into your SauceLabs account
2. Go to "Automated Tests" → "Test Results"
3. View detailed test execution logs, videos, and screenshots

### Local Artifacts
After running tests, artifacts are downloaded to `./artifacts/` including:
- HTML reports
- Allure reports
- Screenshots and videos

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your SAUCE_USERNAME and SAUCE_ACCESS_KEY
   - Check if credentials are properly set in environment

2. **Tests Timeout**
   - Increase timeout in `.sauce/config.yml`
   - Check if your application is accessible from SauceLabs

3. **File Upload Issues**
   - Review `.sauceignore` file
   - Ensure test files are not excluded

4. **Browser Compatibility**
   - Check supported browser versions in SauceLabs documentation
   - Update browser configurations in `.sauce/config.yml`

### Debug Mode
Run with verbose logging:
```bash
npx saucectl run --verbose
```

### Dry Run
Test configuration without running tests:
```bash
npx saucectl run --dry-run
```

## Best Practices

1. **Concurrency**: Start with low concurrency (5) and increase based on your plan
2. **Timeouts**: Set appropriate timeouts for your application
3. **Retries**: Enable retries for flaky tests in cloud environment
4. **Artifacts**: Only collect necessary artifacts to save storage
5. **Tags**: Use meaningful tags for test organization

## Support

- [SauceLabs Documentation](https://docs.saucelabs.com/)
- [Playwright SauceLabs Guide](https://docs.saucelabs.com/web-apps/automated-testing/playwright/)
- [saucectl CLI Reference](https://docs.saucelabs.com/dev/cli/saucectl/)

## Cost Optimization

- Use appropriate concurrency limits
- Set reasonable test timeouts
- Clean up old artifacts regularly
- Use tags to run specific test subsets
