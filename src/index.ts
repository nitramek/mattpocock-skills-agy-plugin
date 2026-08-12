import path from 'path';
import { prepareRepository } from './repo';
import { convertPlugin } from './converter';
import { installPlugin } from './installer';
import { verifyInstallation } from './verifier';

function parseArgs() {
  const args = process.argv.slice(2);
  let command = 'setup';
  let source: string | undefined;
  let pluginName = 'matt';
  let output: string | undefined;
  let isGlobal = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'convert' || arg === 'install' || arg === 'verify' || arg === 'setup' || arg === 'bootstrap') {
      command = arg;
    } else if (arg === '--source' && i + 1 < args.length) {
      source = args[++i];
    } else if (arg === '--name' && i + 1 < args.length) {
      pluginName = args[++i];
    } else if (arg === '--output' && i + 1 < args.length) {
      output = path.resolve(args[++i]);
    } else if (arg === '--local') {
      isGlobal = false;
    } else if (arg === '--global') {
      isGlobal = true;
    }
  }

  if (!output) {
    output = path.join(process.cwd(), 'dist', pluginName);
  }

  return { command, source, pluginName, output, isGlobal };
}

function main() {
  const { command, source, pluginName, output, isGlobal } = parseArgs();

  console.log(`=== Matt Pocock Skills AGY Converter ===`);
  console.log(`Plugin Name: ${pluginName}`);
  console.log(`Command: ${command}`);

  if (command === 'verify') {
    const success = verifyInstallation(pluginName, 'ask-matt');
    if (!success) {
      process.exit(1);
    }
    return;
  }

  const repoPath = prepareRepository({ source });

  const isSetup = command === 'setup' || command === 'bootstrap';

  if (command === 'convert' || command === 'install' || isSetup) {
    convertPlugin({ repoPath, outputDir: output, pluginName });
  }

  if (command === 'install' || isSetup) {
    installPlugin({ sourceDir: output, global: isGlobal });
  }

  if (isSetup) {
    const success = verifyInstallation(pluginName, 'ask-matt');
    if (!success) {
      console.error('[cli] Verification failed.');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}
