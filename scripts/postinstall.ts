#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const pkgJsonPath = join(projectRoot, 'package.json');

try {
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

  // Add simple-git-hooks config
  pkgJson['simple-git-hooks'] = {
    'pre-commit': 'bun run precommit'
  };

  // Add prepare script
  pkgJson.scripts = pkgJson.scripts || {};
  pkgJson.scripts.prepare = 'bun run simple-git-hooks';

  // Write updates back to package.json
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
} catch (error) {
  console.error('Postinstall script failed:', error);
  process.exit(1);
}
