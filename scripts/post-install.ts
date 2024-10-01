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

	writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
} catch (error) {
	console.error('Postinstall script failed:', error)
	process.exit(1)
}
