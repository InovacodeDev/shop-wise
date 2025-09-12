# CI/CD Workflows

This project uses GitHub Actions for continuous integration and quality assurance.

## Workflows

### CI (`ci.yml`)
- **Triggers**: Pull requests to `main` and pushes to `main`
- **Checks**:
  - pnpm installation and setup
  - Security audit with `pnpm audit`
  - Code formatting with Prettier
  - TypeScript type checking
  - Unit tests with Vitest
  - Application build

### Build Verification (`deploy.yml`)
- **Triggers**: Pushes to `main` and manual dispatch
- **Actions**:
  - pnpm installation and setup
  - Runs all CI checks
  - Builds the application
  - Uploads build artifacts for deployment

## Setup

### Required Permissions
The workflows need the following permissions:
- `contents: read` - to checkout code
- `actions: read` - to read workflow and action metadata

## Branch Protection
To prevent commits with errors from being merged:

1. Go to repository Settings > Branches
2. Add rule for `main` branch
3. Require status checks to pass:
   - `quality-checks` (from CI workflow)
4. Require up-to-date branches before merging

## Manual Build Verification
You can trigger a build verification manually:
1. Go to Actions tab
2. Select "Build Verification" workflow
3. Click "Run workflow"

## Workflow Status Badges

Add these badges to your README.md:

```markdown
[![CI](https://github.com/InovacodeDev/shop-wise-web/actions/workflows/ci.yml/badge.svg)](https://github.com/InovacodeDev/shop-wise-web/actions/workflows/ci.yml)
[![Build Verification](https://github.com/InovacodeDev/shop-wise-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/InovacodeDev/shop-wise-web/actions/workflows/deploy.yml)
```
