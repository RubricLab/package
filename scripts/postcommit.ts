#!/usr/bin/env bun

try {
    Bun.spawn(["bunx","standard-version","--release-as", "patch", "--no-verify"]);
	Bun.spawn(["git", "add", "package.json", 'CHANGELOG.md']);
    Bun.spawn(["git", "commit", "--amend", "--no-edit"])
} catch (error) {
  console.error('Post-commit hook failed:', error);
  process.exit(1);
}