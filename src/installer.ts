import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

export interface InstallOptions {
  sourceDir: string;
  target?: string;
  global?: boolean;
  cwd?: string;
}

export function installPlugin(options: InstallOptions): string {
  const { sourceDir, target, global = true, cwd = process.cwd() } = options;

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source plugin directory does not exist: ${sourceDir}`);
  }

  const pluginName = getPluginName(sourceDir);

  let destPath: string;

  if (target) {
    destPath = path.resolve(target);
  } else if (global) {
    destPath = path.join(os.homedir(), '.gemini', 'config', 'plugins', pluginName);
  } else {
    destPath = path.join(cwd, '.agents', 'plugins', pluginName);
  }

  console.log(`[installer] Installing plugin "${pluginName}" to ${destPath}...`);

  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  copyDirSync(sourceDir, destPath);

  console.log(`[installer] Plugin files copied to ${destPath}`);

  // Re-enable plugin in agy so skills are immediately re-indexed
  try {
    console.log(`[installer] Refreshing agy plugin registry for "${pluginName}"...`);
    execSync(`agy plugin disable "${pluginName}"`, { stdio: 'ignore' });
    execSync(`agy plugin enable "${pluginName}"`, { stdio: 'ignore' });
    console.log(`[installer] agy plugin "${pluginName}" enabled successfully.`);
  } catch (err) {
    console.warn(`[installer] Warning: failed to refresh agy plugin registry automatically.`);
  }

  return destPath;
}

function getPluginName(pluginDir: string): string {
  const manifestPath = path.join(pluginDir, 'plugin.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (data.name) return data.name;
    } catch (_) {}
  }
  return path.basename(pluginDir);
}

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
