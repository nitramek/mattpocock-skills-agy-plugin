import fs from 'fs';
import path from 'path';

export interface ConvertOptions {
  repoPath: string;
  outputDir: string;
  pluginName?: string;
}

export function convertPlugin(options: ConvertOptions): string {
  const { repoPath, outputDir, pluginName = 'matt' } = options;
  const manifestPath = path.join(repoPath, '.claude-plugin', 'plugin.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }

  const rawManifest = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(rawManifest);

  // 1. Prepare target plugin directory
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  // 2. Write AGY plugin.json with pluginName "matt"
  const agyManifest = {
    name: pluginName,
    version: manifest.version || '1.0.0',
    description: manifest.description || "Matt Pocock's skills for AGY"
  };
  fs.writeFileSync(
    path.join(outputDir, 'plugin.json'),
    JSON.stringify(agyManifest, null, 2),
    'utf-8'
  );

  // 3. Process skills
  const outputSkillsDir = path.join(outputDir, 'skills');
  fs.mkdirSync(outputSkillsDir, { recursive: true });

  const skillDirs = findSkillDirectories(repoPath, manifest.skills);
  console.log(`[converter] Found ${skillDirs.length} skills to convert.`);

  let convertedCount = 0;
  for (const srcSkillDir of skillDirs) {
    const skillName = path.basename(srcSkillDir);
    const destSkillDir = path.join(outputSkillsDir, skillName);

    // Copy directory structure recursively
    copyDirectorySync(srcSkillDir, destSkillDir);

    // Clean up SKILL.md frontmatter
    const skillMdPath = path.join(destSkillDir, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      cleanSkillFrontmatter(skillMdPath, skillName);
      convertedCount++;
    } else {
      console.warn(`[converter] Warning: SKILL.md missing in ${srcSkillDir}`);
    }
  }

  console.log(`[converter] Successfully converted ${convertedCount} skills into ${outputDir}`);
  return outputDir;
}

function findSkillDirectories(repoPath: string, declaredSkills?: string[]): string[] {
  const result: string[] = [];

  if (declaredSkills && Array.isArray(declaredSkills)) {
    for (const relPath of declaredSkills) {
      const fullPath = path.join(repoPath, relPath);
      if (fs.existsSync(fullPath) && fs.existsSync(path.join(fullPath, 'SKILL.md'))) {
        result.push(fullPath);
      }
    }
  }

  // If no declared skills or missing some, scan `skills/` recursively
  const rootSkillsDir = path.join(repoPath, 'skills');
  if (fs.existsSync(rootSkillsDir)) {
    scanSkillsDirectory(rootSkillsDir, result);
  }

  // Deduplicate by basename / resolved path
  const uniquePaths = new Map<string, string>();
  for (const dirPath of result) {
    const name = path.basename(dirPath);
    if (!uniquePaths.has(name)) {
      uniquePaths.set(name, dirPath);
    }
  }

  return Array.from(uniquePaths.values());
}

function scanSkillsDirectory(dir: string, results: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fs.existsSync(path.join(fullPath, 'SKILL.md'))) {
        results.push(fullPath);
      } else {
        scanSkillsDirectory(fullPath, results);
      }
    }
  }
}

function cleanSkillFrontmatter(skillMdPath: string, skillName: string): void {
  const content = fs.readFileSync(skillMdPath, 'utf-8');
  
  // Match frontmatter between opening --- and closing ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    const newContent = `---\nname: ${skillName}\n---\n\n` + content;
    fs.writeFileSync(skillMdPath, newContent, 'utf-8');
    return;
  }

  const frontmatterContent = match[1];
  const bodyContent = content.slice(match[0].length);

  // Ensure `name:` is present without stripping any metadata (such as disable-model-invocation)
  const lines = frontmatterContent.split('\n');
  const hasName = lines.some(line => line.trim().startsWith('name:'));

  if (!hasName) {
    const updatedFrontmatter = `name: ${skillName}\n` + frontmatterContent;
    const newContent = `---\n${updatedFrontmatter}\n---\n` + bodyContent;
    fs.writeFileSync(skillMdPath, newContent, 'utf-8');
  }
}

function copyDirectorySync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
