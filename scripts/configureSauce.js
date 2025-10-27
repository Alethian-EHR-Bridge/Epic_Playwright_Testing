const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../src/config/config.json');

// Helper function to update config
function updateSauceConfig(updates) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (updates.region) config.sauceLabs.region = updates.region;
  if (updates.concurrency) config.sauceLabs.concurrency = updates.concurrency;
  if (updates.platforms) config.sauceLabs.platforms = updates.platforms;
  if (updates.testSuites) config.sauceLabs.testSuites = updates.testSuites;
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Configuration updated successfully!');
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'set-region':
    updateSauceConfig({ region: args[1] });
    break;
    
  case 'set-concurrency':
    updateSauceConfig({ concurrency: parseInt(args[1]) });
    break;
    
  case 'add-platform':
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const newPlatform = {
      name: args[1],
      platformName: args[2],
      screenResolution: args[3],
      browserName: args[4],
      project: args[4]
    };
    config.sauceLabs.platforms.push(newPlatform);
    updateSauceConfig({ platforms: config.sauceLabs.platforms });
    break;
    
  case 'list-platforms':
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('\n📋 Current Platforms:');
    currentConfig.sauceLabs.platforms.forEach((platform, index) => {
      console.log(`${index + 1}. ${platform.name}`);
      console.log(`   Platform: ${platform.platformName}`);
      console.log(`   Resolution: ${platform.screenResolution}`);
      console.log(`   Browser: ${platform.browserName}\n`);
    });
    break;
    
  case 'help':
  default:
    console.log(`
🔧 SauceLabs Configuration Utility

Usage:
  node scripts/configureSauce.js <command> [arguments]

Commands:
  set-region <region>                    Set SauceLabs region (us-west-1, eu-central-1)
  set-concurrency <number>               Set concurrency level (1-10)
  add-platform <name> <platform> <resolution> <browser>
                                        Add new platform configuration
  list-platforms                        List all configured platforms
  help                                  Show this help message

Examples:
  node scripts/configureSauce.js set-region eu-central-1
  node scripts/configureSauce.js set-concurrency 2
  node scripts/configureSauce.js add-platform "Edge Windows" "Windows 11" "1920x1080" "chromium"
  node scripts/configureSauce.js list-platforms
`);
    break;
}
