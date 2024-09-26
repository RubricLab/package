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
	packageJson.version = versionParts.join('.')

	writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`)

	const commitHash = spawnSync(['git', 'rev-parse', 'HEAD']).stdout.toString().trim()

	const commitMessage = spawnSync(['git', 'log', '-1', '--pretty=%B']).stdout.toString().trim()

	const commitDate = spawnSync(['git', 'log', '-1', '--pretty=%cd', '--date=short'])
		.stdout.toString()
		.trim()

	let repositoryUrl = spawnSync(['git', 'config', '--get', 'remote.origin.url'])
		.stdout.toString()
		.trim()

	if (repositoryUrl.endsWith('.git')) {
		repositoryUrl = repositoryUrl.slice(0, -4)
	}
	if (repositoryUrl.startsWith('git@')) {
		repositoryUrl = repositoryUrl.replace('git@', 'https://').replace(':', '/')
	}

	const commitUrl = `${repositoryUrl}/commit/${commitHash}`

	const changelogEntry = `- [${commitDate}] [${commitMessage}](${commitUrl})\n`

	const changelogPath = 'CHANGELOG.md'
	let changelogContent = ''
	if (existsSync(changelogPath)) {
		changelogContent = readFileSync(changelogPath, 'utf-8')
	} else {
		changelogContent = '# Changelog\n\n'
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
