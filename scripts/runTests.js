const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    envLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('📄 Loaded environment variables from .env file');
  }
}

const configPath = path.join(__dirname, '../src/config/config.json');

// Read configuration
function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Run command and handle output
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    // Load environment variables first
    loadEnvFile();

    const config = readConfig();
    const environment = config.execution.environment;
    const browser = config.execution.browser;
    const browserDisplayName = config.availableBrowsers[browser].displayName;

    console.log('\n🔧 Test Configuration:');
    console.log('======================');
    console.log(`Environment: ${config.environments[environment].name}`);
    console.log(`Browser: ${browserDisplayName} (${browser})`);
    
    if (environment === 'sauceLabs') {
      const platform = config.sauceLabs.availablePlatforms[config.sauceLabs.selectedPlatform];
      console.log(`Platform: ${platform.name}`);
      console.log(`Region: ${config.sauceLabs.region}`);
    }
    
    console.log('======================\n');

    if (environment === 'local') {
      console.log('🏠 Running tests locally...\n');
      await runCommand('npx', ['playwright', 'test']);
    } else if (environment === 'sauceLabs') {
      console.log('☁️  Running tests on SauceLabs...\n');
      
      // Generate SauceLabs config first
      console.log('📝 Generating SauceLabs configuration...');
      await runCommand('node', ['scripts/generateSauceConfig.js']);
      
      // Run tests on SauceLabs
      console.log('🚀 Launching tests on SauceLabs cloud...');

      // Ensure SauceLabs credentials are set
      if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
        throw new Error('SauceLabs credentials not found. Please check your .env file contains SAUCE_USERNAME and SAUCE_ACCESS_KEY');
      }

      console.log(`🔑 Using SauceLabs username: ${process.env.SAUCE_USERNAME}`);

      await runCommand('npx', ['saucectl', 'run'], {
        env: {
          ...process.env,
          SAUCE_USERNAME: process.env.SAUCE_USERNAME,
          SAUCE_ACCESS_KEY: process.env.SAUCE_ACCESS_KEY
        }
      });
    } else {
      throw new Error(`Unknown environment: ${environment}`);
    }

    console.log('\n✅ Tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  // If arguments are provided, pass them to playwright
  console.log('🔧 Passing arguments to Playwright...');
  const config = readConfig();
  if (config.execution.environment === 'local') {
    runCommand('npx', ['playwright', 'test', ...args])
      .then(() => console.log('\n✅ Tests completed successfully!'))
      .catch((error) => {
        console.error('\n❌ Test execution failed:', error.message);
        process.exit(1);
      });
  } else {
    console.log('⚠️  Arguments are only supported for local environment.');
    console.log('For SauceLabs, modify the testSuites in config.json');
    main();
  }
} else {
  // No arguments, run normally
  main();
}
