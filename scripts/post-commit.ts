#!/usr/bin/env bun

import { spawnSync } from 'bun'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

if (process.env.AMENDING) {
	process.exit(0)
}

try {
	const packageJsonContent = readFileSync('package.json', 'utf-8')
	const packageJson = JSON.parse(packageJsonContent)

	const versionParts = packageJson.version.split('.').map(Number)
	versionParts[2] += 1
	const newVersion = versionParts.join('.')
	packageJson.version = newVersion

	writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`)

	const commitMessage = spawnSync(['git', 'log', '-1', '--pretty=%B']).stdout.toString().trim()

	const date = new Date()
	const formattedDate = date.toISOString().split('T')[0]

	const changelogEntry = `## [${newVersion}] - ${formattedDate}

### Added
- ${commitMessage}

`

	const changelogPath = 'CHANGELOG.md'
	let changelogContent = ''
	if (existsSync(changelogPath)) {
		changelogContent = readFileSync(changelogPath, 'utf-8')
	} else {
		changelogContent =
			'# Changelog\n\nAll notable changes to this project will be documented in this file.\n'
	}

	writeFileSync(changelogPath, `${changelogEntry}${changelogContent}`)

	spawnSync(['git', 'add', 'package.json', 'CHANGELOG.md'])

	spawnSync(['git', 'commit', '--amend', '--no-verify', '--no-edit'], {
		env: { ...process.env, AMENDING: 'true' }
	})
} catch (error) {
	console.error('Post-commit hook failed:', error)
	process.exit(1)
}
