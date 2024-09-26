#!/usr/bin/env bun

import { spawnSync } from 'bun';
import { readFileSync, writeFileSync } from 'node:fs';

try {
  const packageJsonContent = readFileSync('package.json', 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  const versionParts = packageJson.version.split('.').map(Number);
  versionParts[2] += 1;
  packageJson.version = versionParts.join('.');

  writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

  const commitMessage = spawnSync(['git', 'log', '-1', '--pretty=%B'])
    .stdout.toString()
    .trim();

  console.log(commitMessage)

  const changelogPath = 'CHANGELOG.md';
  let changelogContent = '';

  changelogContent = readFileSync(changelogPath, 'utf-8');
  
  writeFileSync(changelogPath, `${changelogContent}\n- ${commitMessage}`);

  spawnSync(['git', 'add', 'package.json', 'CHANGELOG.md']);

  spawnSync(['git', 'commit', '--amend', '--no-verify', '--no-edit']);

} catch (error) {
  console.error('Post-commit hook failed:', error);
  process.exit(1);
}
