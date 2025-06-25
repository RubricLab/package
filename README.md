# Package

A tool for scaffolding and publishing NPM packages quickly.

## Getting Started

### Global Installation

Run `bun add -g @rubriclab/package`.

### Per-project Installation

Run `bun add -d @rubriclab/package`.

### Init a package

Ensure you have a `package.json`. If not, run `bun init`.

Run `bunx rubriclab-package setup-package`. This will add a few resources to your package:

- a publish workflow
  - on push to main, the NPM package will be bumped and auto-published
- scripts
  - `lint`: checks for code issues
  - `format`: tries to fix code issues
  - `bleed`: updates all dependencies to `latest`
  - `clean`: clears node modules and cache

## CLI

Run `bunx rubriclab-package` to see the available commands.
