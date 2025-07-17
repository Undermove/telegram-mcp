# GitHub Actions Setup

## Required Secrets

To enable automatic publishing to npm, you need to configure the following secrets in your GitHub repository:

### 1. NPM_TOKEN

1. Go to https://www.npmjs.com/settings/tokens
2. Click "Generate New Token"
3. Select "Automation" token type
4. Copy the generated token
5. In your GitHub repository, go to Settings → Secrets and variables → Actions
6. Click "New repository secret"
7. Name: `NPM_TOKEN`
8. Value: paste your npm token

### 2. GITHUB_TOKEN (Automatic)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and doesn't need to be configured manually.

## Workflow Configuration

The repository includes two main workflows:

### 1. Test Workflow (`.github/workflows/test.yml`)
- Runs on pull requests and pushes to main
- Tests the code on Node.js 18 and 20
- Runs all tests including readonly mode tests
- Validates package creation

### 2. Publish Workflow (`.github/workflows/publish.yml`)
- Runs on pushes to main branch
- Checks if version in package.json is new
- Runs tests before publishing
- Publishes to npm if version is new
- Creates GitHub release
- Can be triggered manually with custom version

## Manual Workflow Trigger

You can manually trigger the publish workflow:

1. Go to the "Actions" tab in your repository
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Optionally specify a version number
5. Click "Run workflow"

## Publishing Process

### Automatic (Recommended)

1. Update version using: `npm run version:patch` (or minor/major)
2. Commit and push: `git add . && git commit -m "chore: bump version to X.X.X" && git push`
3. GitHub Actions will automatically publish

### Manual

1. Go to Actions tab
2. Select "Publish to npm"
3. Click "Run workflow"
4. Specify version (optional)
5. Click "Run workflow"

## Repository Settings

Make sure your repository has:

- Actions enabled (Settings → Actions → General)
- Workflow permissions set to "Read and write permissions" (Settings → Actions → General → Workflow permissions)

## Troubleshooting

### NPM Token Issues

If publishing fails with authentication errors:

1. Verify your npm token is correct
2. Check if token has expired
3. Ensure token has publish permissions
4. Regenerate token if needed

### Version Conflicts

If you get "version already exists" errors:

1. Check current npm version: `npm view telegram-mcp-server version`
2. Update your local version to be higher
3. Re-run the publishing process

### Workflow Permissions

If you get permission errors:

1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Save changes

## Security Notes

- NPM_TOKEN should be kept secret
- Don't commit .env files with tokens
- Use scoped tokens when possible
- Regularly rotate your npm tokens