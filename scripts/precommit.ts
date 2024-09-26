#!/usr/bin/env bun

try {
	Bun.spawn(["echo","pre-commit"]);
} catch (error) {
	console.error('Pre-commit hook failed:', error)
	process.exit(1)
}
