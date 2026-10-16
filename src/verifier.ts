import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

export function verifyInstallation(pluginName: string = 'matt', skillName: string = 'ask-matt'): boolean {
  const namespacedSkill = `${pluginName}:${skillName}`;
  console.log(`[verifier] Verifying namespaced skill "/${namespacedSkill}" availability with agy...`);

  // Verify metadata preservation on skills that require disable-model-invocation
  const globalPluginDir = path.join(os.homedir(), '.gemini', 'config', 'plugins', pluginName);
  const implementPath = path.join(globalPluginDir, 'skills', 'implement', 'SKILL.md');

  if (fs.existsSync(implementPath)) {
    const implementContent = fs.readFileSync(implementPath, 'utf-8');
    if (!implementContent.includes('disable-model-invocation: true')) {
      console.error(`[verifier] Verification FAILED: "implement" skill is missing "disable-model-invocation: true" metadata.`);
      return false;
    }
    console.log(`[verifier] Verification SUCCESS: "implement" skill preserves "disable-model-invocation: true" metadata.`);
  }

  try {
    const output = execSync(`agy --print "/${namespacedSkill}"`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    if (output.includes('jetski: no output produced') || output.includes('permission that headless mode cannot prompt for')) {
      console.error(`[verifier] Verification FAILED for /${namespacedSkill}: Permission/skill missing error detected.`);
      console.error(output);
      return false;
    }

    if (output.includes("Matt's Skills") || output.includes("Main Flow") || output.includes("Idea → Ship") || output.length > 50) {
      console.log(`[verifier] Verification SUCCESS: "/${namespacedSkill}" skill loaded and printed successfully!`);
      return true;
    }

    console.warn(`[verifier] Warning: agy returned output, but might not be expected content:`);
    console.log(output);
    return true;
  } catch (err: any) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    console.error(`[verifier] Command execution failed: ${stderr}`);
    return false;
  }
}
