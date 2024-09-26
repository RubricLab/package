#!/usr/bin/env bun

import { execSync } from 'node:child_process';

try {
  execSync('bun run lint', { stdio: 'inherit' });
  execSync('bun run test', { stdio: 'inherit' });
  execSync('bun run version:patch', { stdio: 'inherit' });
  execSync('git add package.json CHANGELOG.md', { stdio: 'inherit' });
} catch (error) {
  console.error('Pre-commit hook failed:', error);
  process.exit(1);
}
