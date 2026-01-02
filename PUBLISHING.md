# Publishing Guide

This guide explains how to publish the ApiBench packages to npm.

## Prerequisites

1. **npm account**: Make sure you have an npm account and are logged in
   ```bash
   npm login
   ```

2. **Build all packages**: Ensure everything is built
   ```bash
   npm run build
   ```

## Publishing Order

The packages must be published in this order because of dependencies:

1. **@apibench/core** (dependency for CLI)
2. **apibench** (CLI package)

## Step 1: Publish @apibench/core

```bash
cd packages/core

# Verify the package is ready
npm pack --dry-run

# Publish (use --access public for scoped packages)
npm publish --access public
```

## Step 2: Update CLI Package Dependency

After publishing @apibench/core, update the CLI package to reference the published version:

```bash
cd packages/cli

# Update the dependency version in package.json
# Change "@apibench/core": "^1.0.0" to match the published version
```

## Step 3: Publish apibench CLI

```bash
cd packages/cli

# Verify the package is ready
npm pack --dry-run

# Publish
npm publish
```

## Verification

After publishing, verify the packages are available:

```bash
npm view @apibench/core
npm view apibench
```

## Testing Published Package

Test the published package:

```bash
npm install -g apibench
apibench --version
apibench run --url "https://api.github.com/zen" --iterations 5
```

## Updating Package Information

Before publishing, make sure to update:

1. **package.json**:
   - `author`: Your name/email
   - `repository.url`: Your GitHub repository URL
   - `version`: Follow semantic versioning (1.0.0, 1.0.1, etc.)

2. **README.md**: Ensure it's complete and accurate

## Version Management

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

Update version:

```bash
npm version patch  # or minor, or major
```

## Troubleshooting

### "Package name already exists"
- The package name might be taken
- Consider using a scoped package: `@yourusername/apibench`

### "Cannot find module @apibench/core"
- Make sure @apibench/core is published first
- Check the version in package.json matches the published version

### "Access denied"
- For scoped packages, use `--access public`
- Make sure you're logged in: `npm whoami`

## Notes

- The `prepublishOnly` script will automatically build before publishing
- Only files listed in `files` array (or not in `.npmignore`) will be published
- Make sure `dist/` folder is built and included

