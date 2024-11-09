#!/usr/bin/env bun

import { join } from 'node:path'

try {
	const projectRoot = process.cwd()
	const pkgJsonPath = join(projectRoot, 'package.json')

	const pkgJson = await Bun.file(pkgJsonPath).json()

	pkgJson['simple-git-hooks'] = { 'post-commit': 'bun run rubriclab-postcommit' }

	pkgJson.scripts = pkgJson.scripts || {}
	pkgJson.scripts.prepare = 'bun x simple-git-hooks'
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
} catch (error) {
	console.error('Postinstall script failed:', error)
	process.exit(1)
}
