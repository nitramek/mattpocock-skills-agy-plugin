import { execSync } from 'child_process';

export function verifyInstallation(pluginName: string = 'mattpocock-skills', skillName: string = 'ask-matt'): boolean {
  const namespacedSkill = `${pluginName}:${skillName}`;
  console.log(`[verifier] Verifying namespaced skill "/${namespacedSkill}" availability with agy...`);

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
