# Contributing to Telegram MCP Local Server

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

## Publishing Process

### Automatic Publishing (Recommended)

The project uses GitHub Actions for automatic publishing to npm when changes are merged to the main branch.

1. **Update version**: Use one of the version bump scripts:
   ```bash
   npm run version:patch  # for bug fixes (1.0.0 → 1.0.1)
   npm run version:minor  # for new features (1.0.0 → 1.1.0)
   npm run version:major  # for breaking changes (1.0.0 → 2.0.0)
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "chore: bump version to X.X.X"
   git push origin main
   ```

3. **GitHub Actions will automatically**:
   - Run tests
   - Build the project
   - Publish to npm
   - Create a GitHub release

### Manual Publishing

If you need to publish manually:

1. Make sure you're logged in to npm: `npm login`
2. Build the project: `npm run build`
3. Publish: `npm publish`

### Emergency Publishing

For emergency releases, you can trigger a manual publish via GitHub Actions:

1. Go to the "Actions" tab in the GitHub repository
2. Select the "Publish to npm" workflow
3. Click "Run workflow"
4. Optionally specify a version number

## Prerequisites for Publishing

### NPM Token Setup

1. Create an npm access token at https://www.npmjs.com/settings/tokens
2. Add it as `NPM_TOKEN` in GitHub repository secrets

### GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

## Testing

Before publishing, make sure all tests pass:

```bash
npm test                    # Run Jest tests
npm run test-readonly      # Test readonly mode functionality
npm run build              # Ensure project builds successfully
```

## Version Strategy

We follow semantic versioning (semver):

- **Patch** (1.0.0 → 1.0.1): Bug fixes, security patches
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## Release Notes

GitHub Actions automatically creates release notes with:
- Version information
- Installation instructions
- Link to commit history

## Workflow Overview

```
Developer → Version Bump → Commit → Push → GitHub Actions → npm Publish → GitHub Release
```

## Troubleshooting

### Publication Failed

1. Check if the version already exists on npm
2. Verify npm token is valid
3. Check GitHub Actions logs for detailed error messages

### Tests Failing

1. Run tests locally: `npm test`
2. Check for environment-specific issues
3. Update dependencies if needed

### Version Conflicts

If you get version conflicts:
1. Check current npm version: `npm view telegram-mcp-local-server version`
2. Update local version to be higher than npm version
3. Re-run the publishing process

## Local Development

For local development and testing:

```bash
# Install dependencies
npm install

# Build and watch for changes
npm run dev

# Test the built package
npm run build
npm pack
npm install -g ./telegram-mcp-local-server-*.tgz

# Test the global command
telegram-mcp-local-server --help
```

## Environment Variables

For testing, you can use these environment variables:

```bash
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_SESSION_STRING=your_session_string
TELEGRAM_READONLY_MODE=true
```