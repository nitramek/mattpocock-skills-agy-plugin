import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DEFAULT_REPO_URL = 'https://github.com/mattpocock/skills.git';
const CACHE_DIR_NAME = '.cache/mattpocock-skills';

export interface RepoOptions {
  source?: string;
  cwd?: string;
}

export function prepareRepository(options: RepoOptions = {}): string {
  const baseDir = options.cwd || process.cwd();
  const source = options.source;

  // Case 1: Source is specified and is a local directory
  if (source && fs.existsSync(source) && fs.statSync(source).isDirectory()) {
    const absPath = path.resolve(source);
    validateRepo(absPath);
    return absPath;
  }

  // Case 2: Source is a git URL (or default)
  const repoUrl = (source && source.startsWith('http')) ? source : DEFAULT_REPO_URL;
  const cachePath = path.join(baseDir, CACHE_DIR_NAME);

  if (fs.existsSync(cachePath)) {
    console.log(`[repo] Updating cached repository at ${cachePath}...`);
    try {
      execSync('git pull --rebase', { cwd: cachePath, stdio: 'inherit' });
    } catch (err) {
      console.warn(`[repo] Warning: git pull failed in ${cachePath}, using existing cached copy.`);
    }
  } else {
    console.log(`[repo] Cloning repository ${repoUrl} to ${cachePath}...`);
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    execSync(`git clone ${repoUrl} "${cachePath}"`, { stdio: 'inherit' });
  }

  validateRepo(cachePath);
  return cachePath;
}

function validateRepo(repoPath: string): void {
  const manifestPath = path.join(repoPath, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Invalid repository at ${repoPath}: missing .claude-plugin/plugin.json`);
  }
}
