#!/usr/bin/env node

/**
 * Script to bump version in package.json
 * Usage: node scripts/bump-version.js [patch|minor|major]
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const versionType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

try {
  // Read current package.json
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  
  console.log(`Current version: ${currentVersion}`);
  
  // Bump version using npm
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });
  
  // Read updated package.json
  const updatedPackageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const newVersion = updatedPackageJson.version;
  
  console.log(`New version: ${newVersion}`);
  
  // Update README.md if it contains version references
  try {
    let readme = readFileSync('README.md', 'utf8');
    const versionPattern = /telegram-mcp-local-server@[\d.]+/g;
    if (versionPattern.test(readme)) {
      readme = readme.replace(versionPattern, `telegram-mcp-local-server@${newVersion}`);
      writeFileSync('README.md', readme);
      console.log('Updated version references in README.md');
    }
  } catch (error) {
    console.warn('Could not update README.md:', error.message);
  }
  
  console.log(`\nVersion bumped from ${currentVersion} to ${newVersion}`);
  console.log('Run the following commands to publish:');
  console.log('  git add .');
  console.log('  git commit -m "chore: bump version to ' + newVersion + '"');
  console.log('  git push origin main');
  
} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
}