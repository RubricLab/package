#!/usr/bin/env bun

import { spawnSync } from 'bun';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

try {
  // Get the latest commit hash
  const { stdout: hashStdout } = spawnSync(['git', 'rev-parse', 'HEAD']);
  const latestCommitHash = hashStdout.toString().trim();

  // Read the commit message of the latest commit
  const { stdout: messageStdout } = spawnSync(['git', 'log', '-1', '--pretty=%B', latestCommitHash]);
  const commitMessage = messageStdout.toString().trim();

  // Get the date of the commit
  const { stdout: dateStdout } = spawnSync(['git', 'show', '-s', '--format=%ci', latestCommitHash]);
  const commitDate = new Date(dateStdout.toString().trim()).toISOString().split('T')[0];

  // Prepare the changelog entry
  const changelogEntry = `\n\n## ${commitDate}\n\n- ${commitMessage}`;

  // Update CHANGELOG.md
  const changelogPath = 'CHANGELOG.md';
  let changelogContent = '';

  if (existsSync(changelogPath)) {
    changelogContent = readFileSync(changelogPath, 'utf-8');
  }

  writeFileSync(changelogPath, changelogContent + changelogEntry);

  spawnSync(['git', 'add', 'CHANGELOG.md']);

  spawnSync(['git', 'commit', '--amend', '--no-verify', '--no-edit']);

} catch (error) {
  console.error('Post-commit hook failed:', error);
  process.exit(1);
}
