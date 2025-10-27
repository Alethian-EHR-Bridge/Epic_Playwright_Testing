# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Framework
```bash
# View current settings
npm run config

# Set environment and browser
npm run config:env local
npm run config:browser chromium
```

### 3. Run Tests
```bash
# Run tests locally
npm run test:local

# Or run on SauceLabs
npm run config:env sauceLabs
npm run test:sauce
```

## 🔧 Common Commands

### Configuration
```bash
npm run config                    # Show current configuration
npm run config:env local          # Set to local environment
npm run config:env sauceLabs      # Set to SauceLabs environment
npm run config:browser chromium   # Set browser to Chrome
npm run config:browser firefox    # Set browser to Firefox
npm run config:browser webkit     # Set browser to Safari
```

### Testing
```bash
npm run test                      # Run with current settings
npm run test:local               # Run locally
npm run test:sauce               # Run on SauceLabs
npm run clean                    # Clean test artifacts
```

### SauceLabs Configuration
```bash
npm run config:platform windows  # Set Windows platform
npm run config:platform macos    # Set macOS platform
npm run config:region eu-central-1  # Set EU region
npm run config:region us-west-1     # Set US region
```

## 📋 Framework Features

✅ **Single Browser Execution** - Run tests with one browser at a time  
✅ **Environment Switching** - Easy switch between local and SauceLabs  
✅ **Centralized Configuration** - All settings in one place  
✅ **Simple Commands** - Easy-to-remember npm scripts  
✅ **Page Object Model** - Clean, maintainable test structure  
✅ **Allure Reporting** - Beautiful test reports  

## 🎯 Example Workflows

### Local Development
```bash
npm run config:env local
npm run config:browser chromium
npm run test:local
```

### SauceLabs Testing
```bash
npm run config:env sauceLabs
npm run config:browser firefox
npm run config:platform windows
npm run test:sauce
```

### Generate Reports
```bash
npm run test:report  # Run tests and generate Allure report
```

## 📁 Key Files

- `src/config/config.json` - Main configuration file
- `src/tests/` - Test files
- `src/pages/` - Page Object Model classes
- `scripts/manageFramework.js` - Configuration utility

## 🆘 Need Help?

```bash
npm run config:help  # Show configuration help
```

Check the main [README.md](README.md) for detailed documentation.
