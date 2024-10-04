#!/usr/bin/env bun

import { spawnSync } from 'bun'

if (process.env.AMENDING) {
	process.exit(0)
}

const run = (
	command: `${string} ${string}`,
	options?: {
		env?: { [key: string]: string }
	}
) => {
	const { stdout } = spawnSync(command.split(' '), options)
	return stdout.toString().trim()
}

const CHANGELOG_PATH = 'CHANGELOG.md'
const PACKAGE_PATH = 'package.json'

try {
	const packageJsonContent = Bun.file(PACKAGE_PATH)
	const packageJson = await packageJsonContent.json()

	console.log({ packageJson })

	const versionParts = packageJson.version.split('.').map(Number)
	versionParts[2] += 1
	packageJson.version = versionParts.join('.')

	await Bun.write(PACKAGE_PATH, `${JSON.stringify(packageJson, null, 2)}\n`)

	const commitHash = run('git rev-parse HEAD')
	const commitMessage = run('git log -1 --pretty=%B')
	const commitDate = run('git log -1 --pretty=%cd --date=short')
	let repositoryUrl = run('git config --get remote.origin.url')

	if (repositoryUrl.endsWith('.git')) {
		repositoryUrl = repositoryUrl.slice(0, -4)
	}
	if (repositoryUrl.startsWith('git@')) {
		repositoryUrl = repositoryUrl.replace('git@', 'https://').replace(':', '/')
	}

	const commitUrl = `${repositoryUrl}/commit/${commitHash}`
	const changelogEntry = `- [${commitDate}] [${commitMessage}](${commitUrl})\n`

	let changelogContent = ''
	const changelog = Bun.file(CHANGELOG_PATH)
	const changelogExists = await changelog.exists()
	if (changelogExists) {
		changelogContent = await changelog.text()
	} else {
		changelogContent = '# Changelog\n\n'
	}

	await Bun.write(CHANGELOG_PATH, `${changelogEntry}${changelogContent}`)

	run('git add package.json CHANGELOG.md')
	run('git commit --amend --no-verify --no-edit', {
		env: { ...process.env, AMENDING: 'true' }
	})
} catch (error) {
	console.error('Post-commit hook failed:', error)
	process.exit(1)
}
