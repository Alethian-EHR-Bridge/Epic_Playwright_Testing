const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config/config.json');

// Helper function to read config
function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Helper function to write config
function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Configuration updated successfully!');
}

// Set execution environment
function setEnvironment(environment) {
  const config = readConfig();
  
  if (!config.environments[environment]) {
    console.log(`❌ Environment '${environment}' not found. Available: ${Object.keys(config.environments).join(', ')}`);
    return;
  }
  
  config.execution.environment = environment;
  writeConfig(config);
  console.log(`✅ Environment set to: ${config.environments[environment].name}`);
  console.log(`   Description: ${config.environments[environment].description}`);
}

// Set browser
function setBrowser(browser) {
  const config = readConfig();
  
  if (!config.availableBrowsers[browser]) {
    console.log(`❌ Browser '${browser}' not found. Available: ${Object.keys(config.availableBrowsers).join(', ')}`);
    return;
  }
  
  config.execution.browser = browser;
  writeConfig(config);
  console.log(`✅ Browser set to: ${config.availableBrowsers[browser].displayName} (${browser})`);
}

// Set SauceLabs platform
function setSauceLabsPlatform(platform) {
  const config = readConfig();
  
  if (!config.sauceLabs.availablePlatforms[platform]) {
    console.log(`❌ Platform '${platform}' not found. Available: ${Object.keys(config.sauceLabs.availablePlatforms).join(', ')}`);
    return;
  }
  
  config.sauceLabs.selectedPlatform = platform;
  writeConfig(config);
  console.log(`✅ SauceLabs platform set to: ${config.sauceLabs.availablePlatforms[platform].name}`);
}

// Set SauceLabs region
function setSauceLabsRegion(region) {
  const config = readConfig();
  config.sauceLabs.region = region;
  writeConfig(config);
  console.log(`✅ SauceLabs region set to: ${region}`);
}

// Set workers for environment
function setWorkers(environment, workers) {
  const config = readConfig();
  if (!config.environments[environment]) {
    console.log(`❌ Environment '${environment}' not found`);
    return;
  }
  config.environments[environment].workers = parseInt(workers);
  writeConfig(config);
  console.log(`✅ Workers for ${environment} set to: ${workers}`);
}

// Set retries for environment
function setRetries(environment, retries) {
  const config = readConfig();
  if (!config.environments[environment]) {
    console.log(`❌ Environment '${environment}' not found`);
    return;
  }
  config.environments[environment].retries = parseInt(retries);
  writeConfig(config);
  console.log(`✅ Retries for ${environment} set to: ${retries}`);
}

// Set concurrency for SauceLabs
function setConcurrency(concurrency) {
  const config = readConfig();
  config.environments.sauceLabs.concurrency = parseInt(concurrency);
  writeConfig(config);
  console.log(`✅ SauceLabs concurrency set to: ${concurrency}`);
}

// Show current configuration
function showConfig() {
  const config = readConfig();
  const currentEnv = config.environments[config.execution.environment];
  const currentBrowser = config.availableBrowsers[config.execution.browser];
  const currentPlatform = config.sauceLabs.availablePlatforms[config.sauceLabs.selectedPlatform];
  
  console.log('\n🔧 Current Framework Configuration:');
  console.log('=====================================');
  console.log(`Environment: ${currentEnv.name}`);
  console.log(`Description: ${currentEnv.description}`);
  console.log(`Browser: ${currentBrowser.displayName} (${config.execution.browser})`);
  console.log(`Base URL: ${config.baseUrl}`);
  
  console.log(`\n⚙️  Environment Settings:`);
  console.log(`Workers: ${currentEnv.workers}`);
  console.log(`Retries: ${currentEnv.retries}`);
  console.log(`Timeout: ${currentEnv.timeout}ms`);
  console.log(`Parallel: ${currentEnv.fullyParallel}`);
  console.log(`Headless: ${currentEnv.headless}`);

  if (config.execution.environment === 'sauceLabs') {
    console.log(`\n🌐 SauceLabs Configuration:`);
    console.log(`Region: ${config.sauceLabs.region}`);
    console.log(`Platform: ${currentPlatform.name}`);
    console.log(`Resolution: ${currentPlatform.screenResolution}`);
    console.log(`Concurrency: ${currentEnv.concurrency}`);
  }
  
  console.log(`\n📋 Test Suites (${config.testSuites.length}):`);
  config.testSuites.forEach((suite, index) => {
    console.log(`${index + 1}. ${path.basename(suite, '.spec.ts')}`);
  });
  
  console.log('\n🌐 Available Environments:');
  Object.keys(config.environments).forEach(env => {
    const marker = env === config.execution.environment ? '→' : ' ';
    console.log(`${marker} ${env}: ${config.environments[env].name}`);
  });
  
  console.log('\n🌍 Available Browsers:');
  Object.keys(config.availableBrowsers).forEach(browser => {
    const marker = browser === config.execution.browser ? '→' : ' ';
    console.log(`${marker} ${browser}: ${config.availableBrowsers[browser].displayName}`);
  });
  
  if (config.execution.environment === 'sauceLabs') {
    console.log('\n🖥️  Available SauceLabs Platforms:');
    Object.keys(config.sauceLabs.availablePlatforms).forEach(platform => {
      const marker = platform === config.sauceLabs.selectedPlatform ? '→' : ' ';
      console.log(`${marker} ${platform}: ${config.sauceLabs.availablePlatforms[platform].name}`);
    });
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'env':
    if (args.length < 2) {
      console.log('Usage: env <environment>');
      console.log('Available environments: local, sauceLabs');
    } else {
      setEnvironment(args[1]);
    }
    break;
    
  case 'browser':
    if (args.length < 2) {
      console.log('Usage: browser <browser>');
      console.log('Available browsers: chromium, firefox, webkit');
    } else {
      setBrowser(args[1]);
    }
    break;
    
  case 'platform':
    if (args.length < 2) {
      console.log('Usage: platform <platform>');
      console.log('Available platforms: windows, macos');
    } else {
      setSauceLabsPlatform(args[1]);
    }
    break;
    
  case 'region':
    if (args.length < 2) {
      console.log('Usage: region <region>');
      console.log('Available regions: us-west-1, eu-central-1');
    } else {
      setSauceLabsRegion(args[1]);
    }
    break;

  case 'workers':
    if (args.length < 3) {
      console.log('Usage: workers <environment> <number>');
      console.log('Example: workers local 3');
    } else {
      setWorkers(args[1], args[2]);
    }
    break;

  case 'retries':
    if (args.length < 3) {
      console.log('Usage: retries <environment> <number>');
      console.log('Example: retries local 2');
    } else {
      setRetries(args[1], args[2]);
    }
    break;

  case 'concurrency':
    if (args.length < 2) {
      console.log('Usage: concurrency <number>');
      console.log('Example: concurrency 2');
    } else {
      setConcurrency(args[1]);
    }
    break;
    
  case 'config':
  case 'show':
    showConfig();
    break;
    
  case 'help':
  default:
    console.log(`
🔧 Framework Management Utility

Usage:
  node scripts/manageFramework.js <command> [arguments]

Commands:
  env <environment>                     Set execution environment (local, sauceLabs)
  browser <browser>                     Set browser (chromium, firefox, webkit)
  platform <platform>                  Set SauceLabs platform (windows, macos)
  region <region>                       Set SauceLabs region (us-west-1, eu-central-1)
  workers <environment> <number>        Set workers for environment
  retries <environment> <number>        Set retries for environment
  concurrency <number>                  Set SauceLabs concurrency
  config | show                         Show current configuration
  help                                  Show this help message

Examples:
  node scripts/manageFramework.js env local
  node scripts/manageFramework.js browser firefox
  node scripts/manageFramework.js platform windows
  node scripts/manageFramework.js region eu-central-1
  node scripts/manageFramework.js workers local 3
  node scripts/manageFramework.js retries sauceLabs 2
  node scripts/manageFramework.js concurrency 2
  node scripts/manageFramework.js config
`);
    break;
}
