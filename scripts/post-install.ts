#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const projectRoot = process.cwd()
const pkgJsonPath = join(projectRoot, 'package.json')

try {
	const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))

	pkgJson['simple-git-hooks'] = {
		'post-commit': 'bun run rubriclab-postcommit'
	}

	pkgJson.scripts = pkgJson.scripts || {}
	pkgJson.scripts.prepare = 'bunx simple-git-hooks'
	pkgJson.scripts.bleed = 'bunx npm-check-updates -u && bun i'
	pkgJson.scripts.clean = 'rm -rf .next && rm -rf node_modules'

	writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2))


	const file = Bun.file(join(projectRoot, 'node_modules/@rubriclab/package/.github/workflows/publish.yml'))
	await Bun.write(join(projectRoot, '.github/workflows/publish.yml'), file)


} catch (error) {
	console.error('Postinstall script failed:', error)
	process.exit(1)
}
