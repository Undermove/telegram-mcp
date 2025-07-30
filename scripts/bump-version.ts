#!/usr/bin/env tsx

/**
 * Script to bump version in package.json
 * Usage: tsx scripts/bump-version.ts [patch|minor|major]
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

interface PackageJson {
  version: string;
  [key: string]: any;
}

type VersionType = 'patch' | 'minor' | 'major';

const VALID_VERSION_TYPES: readonly VersionType[] = ['patch', 'minor', 'major'] as const;

function isValidVersionType(type: string): type is VersionType {
  return VALID_VERSION_TYPES.includes(type as VersionType);
}

function readPackageJson(): PackageJson {
  try {
    const content = readFileSync('package.json', 'utf8');
    return JSON.parse(content) as PackageJson;
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function updateReadme(newVersion: string): void {
  try {
    let readme = readFileSync('README.md', 'utf8');
    const versionPattern = /telegram-mcp-local-server@[\d.]+/g;
    
    if (versionPattern.test(readme)) {
      readme = readme.replace(versionPattern, `telegram-mcp-local-server@${newVersion}`);
      writeFileSync('README.md', readme);
      console.log('Updated version references in README.md');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Could not update README.md:', errorMessage);
  }
}

function bumpVersion(versionType: VersionType): void {
  try {
    // Read current package.json
    const packageJson = readPackageJson();
    const currentVersion = packageJson.version;
    
    console.log(`Current version: ${currentVersion}`);
    
    // Bump version using npm
    const isDryRun = process.argv.includes('--dry-run');
    const npmCommand = isDryRun 
      ? `npm version ${versionType} --no-git-tag-version --dry-run`
      : `npm version ${versionType} --no-git-tag-version`;
    
    if (isDryRun) {
      console.log(`[DRY RUN] Would execute: ${npmCommand}`);
      return;
    }
    
    execSync(npmCommand, { stdio: 'inherit' });
    
    // Read updated package.json
    const updatedPackageJson = readPackageJson();
    const newVersion = updatedPackageJson.version;
    
    console.log(`New version: ${newVersion}`);
    
    // Update README.md if it contains version references
    updateReadme(newVersion);
    
    console.log(`\nVersion bumped from ${currentVersion} to ${newVersion}`);
    console.log('Run the following commands to publish:');
    console.log('  git add .');
    console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
    console.log('  git push origin main');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error bumping version:', errorMessage);
    process.exit(1);
  }
}

function main(): void {
  const versionType = process.argv[2] || 'patch';

  if (!isValidVersionType(versionType)) {
    console.error(`Invalid version type: "${versionType}". Use: ${VALID_VERSION_TYPES.join(', ')}`);
    process.exit(1);
  }

  bumpVersion(versionType);
}

// Execute main function if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}