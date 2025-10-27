# GitHub Actions for SauceLabs Testing

## 🚀 Workflow Overview

The GitHub Actions workflow automatically runs your tests on SauceLabs cloud infrastructure with two execution modes:

### 1. **Manual Trigger** (workflow_dispatch)
- Allows you to manually trigger tests with custom settings
- Choose browser, platform, and region
- Perfect for on-demand testing

### 2. **Automatic Matrix Testing** (push/PR)
- Runs automatically on push to main/develop branches
- Tests multiple browser/platform combinations
- Comprehensive coverage across environments

## 🔧 Setup Requirements

### 1. SauceLabs Secrets
Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `SAUCE_USERNAME`: Your SauceLabs username
   - `SAUCE_ACCESS_KEY`: Your SauceLabs access key

### 2. Repository Configuration
The workflow uses your centralized `config.json` and automatically configures the framework for SauceLabs execution.

## 🎯 Manual Execution

### Trigger Manual Run:
1. Go to **Actions** tab in your GitHub repository
2. Select **"SauceLabs Test Execution"** workflow
3. Click **"Run workflow"**
4. Choose your options:
   - **Browser**: chromium, firefox, webkit
   - **Platform**: windows, macos
   - **Region**: eu-central-1, us-west-1
5. Click **"Run workflow"**

### Manual Options:
```yaml
Browser Options:
  - chromium (Chrome)
  - firefox (Firefox)  
  - webkit (Safari - macOS only)

Platform Options:
  - windows (Windows 11)
  - macos (macOS 12)

Region Options:
  - eu-central-1 (Europe)
  - us-west-1 (US West)
```

## 🔄 Automatic Matrix Testing

Runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Matrix Combinations:
- **Chrome on Windows 11**
- **Chrome on macOS 12**
- **Firefox on Windows 11**
- **Firefox on macOS 12**
- **Safari on macOS 12**

## 📊 Artifacts & Reports

The workflow automatically uploads:

### Test Artifacts:
- SauceLabs test results
- Screenshots and videos
- Test execution logs

### Test Reports:
- Allure reports
- Playwright HTML reports
- JUnit XML reports

### Download Artifacts:
1. Go to the completed workflow run
2. Scroll down to **"Artifacts"** section
3. Download the relevant artifact zip files

## 🔍 Monitoring & Debugging

### View Test Execution:
1. **GitHub Actions**: Check workflow logs for configuration and execution details
2. **SauceLabs Dashboard**: View detailed test execution, videos, and logs
3. **Artifacts**: Download reports for local analysis

### Common Issues:
- **Authentication**: Verify SAUCE_USERNAME and SAUCE_ACCESS_KEY secrets
- **Configuration**: Check workflow logs for framework configuration output
- **Test Failures**: Review SauceLabs dashboard for detailed failure information

## 📝 Workflow Features

✅ **Centralized Configuration**: Uses your `config.json` settings  
✅ **Dynamic Browser Selection**: Choose browser at runtime  
✅ **Multi-Platform Support**: Windows and macOS testing  
✅ **Artifact Collection**: Automatic test result uploads  
✅ **Matrix Testing**: Comprehensive browser/platform coverage  
✅ **Manual Triggers**: On-demand test execution  
✅ **Build Naming**: Clear identification of test runs  

## 🛠️ Customization

To modify the workflow:
1. Edit `.github/workflows/saucelabs-tests.yml`
2. Adjust matrix combinations, add new browsers/platforms
3. Modify artifact collection paths
4. Update trigger conditions

The workflow integrates seamlessly with your centralized framework configuration! 🎯
