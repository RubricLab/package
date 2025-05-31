#!/usr/bin/env bun

import { join } from 'node:path'
import { createCLI } from '@rubriclab/cli'
import { $ } from 'bun'
import { z } from 'zod/v4'

const cli = createCLI({
	name: 'package cli',
	version: '0.0.0',
	description: 'Package CLI tool',
	commands: [
		{
			name: 'prepare',
			description: 'Prepares a submodule',
			args: z.object({}),
			handler: async () => {
				const result =
					await $`rm -r .git/hooks && mkdir -p .git/hooks && ln -s ../../../.git/modules/packages/${process.cwd().split('/').pop()}/hooks .git/hooks && bun x simple-git-hooks`.text()
				console.log(result)
			}
		},
		{
			name: 'post-commit',
			description: 'Runs the post-commit hook',
			args: z.object({}),
			handler: async () => {
				if (process.env.AMENDING) {
					process.exit(0)
				}
				const CHANGELOG_PATH = 'CHANGELOG.md'
				const PACKAGE_PATH = 'package.json'

				const packageJsonContent = Bun.file(PACKAGE_PATH)
				const packageJson = await packageJsonContent.json()

				console.log({ packageJson })

				const versionParts = packageJson.version.split('.').map(Number)
				versionParts[2] += 1
				packageJson.version = versionParts.join('.')

				await Bun.write(PACKAGE_PATH, `${JSON.stringify(packageJson, null, 2)}\n`)

				const commitHash = await $`git rev-parse HEAD`
				const commitMessage = await $`git log -1 --pretty=%B`
				const commitDate = await $`git log -1 --pretty=%cd --date=short`
				let repositoryUrl = await $`git config --get remote.origin.url`.text()

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

				await $`bun x biome format --write ./package.json`
				await $`git add package.json CHANGELOG.md`
				process.env.AMENDING = 'true'
				await $`git commit --amend --no-verify --no-edit`
				process.env.AMENDING = undefined
			}
		},
		{
			name: 'post-install',
			description: 'Runs the post-install hook',
			args: z.object({}),
			handler: async () => {
				const projectRoot = process.cwd()
				const pkgJsonPath = join(projectRoot, 'package.json')

				const pkgJson = await Bun.file(pkgJsonPath).json()

				pkgJson['simple-git-hooks'] = { 'post-commit': 'rubriclab-package post-commit' }

				pkgJson.scripts = pkgJson.scripts || {}
				pkgJson.scripts.prepare = 'rubriclab-package prepare'
				pkgJson.scripts.bleed = 'bun x npm-check-updates -u'
				pkgJson.scripts.clean = 'rm -rf .next && rm -rf node_modules'
				pkgJson.scripts.format = 'bun x biome format --write .'
				pkgJson.scripts.lint = 'bun x biome check .'
				pkgJson.scripts['lint:fix'] = 'bun x biome lint . --write --unsafe'
				pkgJson.publishConfig = { access: 'public' }

				const file = Bun.file(join(import.meta.dir, '..', 'workflows/publish-package.yml'))

				await Promise.all([
					Bun.write(pkgJsonPath, JSON.stringify(pkgJson, null, 2)),
					Bun.write(join(projectRoot, '.github/workflows/publish.yml'), file)
				])

				console.log('Set up package successfully.')
			}
		}
	]
})

cli.parse()
