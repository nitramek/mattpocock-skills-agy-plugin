import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DEFAULT_REPO_URL = 'https://github.com/mattpocock/skills.git';
const CACHE_DIR_NAME = '.cache/mattpocock-skills';

export interface RepoOptions {
  source?: string;
  tag?: string;
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

  if (!fs.existsSync(cachePath)) {
    console.log(`[repo] Cloning repository ${repoUrl} to ${cachePath}...`);
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    execSync(`git clone ${repoUrl} "${cachePath}"`, { stdio: 'inherit' });
  } else {
    console.log(`[repo] Fetching latest refs and tags for ${cachePath}...`);
    try {
      execSync('git fetch --all --tags', { cwd: cachePath, stdio: 'ignore' });
    } catch (err) {
      console.warn(`[repo] Warning: git fetch failed in ${cachePath}, using local git cache.`);
    }
  }

  // Checkout target version (tag or ref)
  const targetTag = options.tag || getLatestVersionTag(cachePath);
  
  if (targetTag) {
    console.log(`[repo] Checking out version target: "${targetTag}"...`);
    try {
      execSync(`git checkout "${targetTag}"`, { cwd: cachePath, stdio: 'ignore' });
    } catch (err) {
      console.warn(`[repo] Failed to checkout "${targetTag}", remaining on current HEAD.`);
    }
  }

  validateRepo(cachePath);
  return cachePath;
}

export function getLatestVersionTag(repoPath: string): string | undefined {
  try {
    const raw = execSync('git tag -l --sort=-v:refname', { cwd: repoPath, encoding: 'utf-8' });
    const tags = raw.split('\n').map(t => t.trim()).filter(Boolean);
    const versionTags = tags.filter(t => /^v?\d+\.\d+\.\d+/.test(t));
    return versionTags[0];
  } catch (_) {
    return undefined;
  }
}

function validateRepo(repoPath: string): void {
  const manifestPath = path.join(repoPath, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Invalid repository at ${repoPath}: missing .claude-plugin/plugin.json`);
  }
}
