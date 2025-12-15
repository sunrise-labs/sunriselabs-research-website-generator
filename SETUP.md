# Setup Guide

## Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token with `repo` and `read:org` permissions
- Access to the `sunrise-labs` GitHub organization

## Initial Setup

### 1. Install Dependencies

```bash
cd sunriselabs-research-website-generator
npm install
```

### 2. Test Locally

The repository includes sample documentation for testing:

```bash
npm run build
```

This will generate the site in `dist/` using the sample files in `temp/documentation/`.

### 3. Preview the Site

```bash
npx http-server dist -p 8000
```

Visit http://localhost:8000 to see the generated site.

## GitHub Setup

### Create Repository

1. Create a new repository: `sunrise-labs/sunriselabs-research-website-generator`

2. Initialize and push this code:

```bash
git init
git add .
git commit -m "Initial commit: Sunrise Labs static site generator"
git branch -M main
git remote add origin git@github.com:sunrise-labs/sunriselabs-research-website-generator.git
git push -u origin main
```

### Configure GitHub Pages

1. Go to repository Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **root**
4. Save

The workflow will create the `gh-pages` branch on first run.

### Set Up Custom Domain

1. Add DNS CNAME record:
   ```
   sunriselabs.io → sunrise-labs.github.io
   ```

2. In GitHub repository settings → Pages:
   - Custom domain: `sunriselabs.io`
   - Enforce HTTPS: ✓

The workflow automatically creates the CNAME file.

## Configure Research Repositories

For each research repository that should trigger website updates:

### 1. Add Workflow File

Copy the example workflow:

```bash
cp .github/workflows/EXAMPLE-notify-website.yml \
   /path/to/research-repo/.github/workflows/notify-website.yml
```

### 2. Create GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Scopes: `repo` (full control)
4. Copy the token

### 3. Add Repository Secret

In each research repository:

1. Go to Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `SITE_GENERATOR_TOKEN`
   - Value: (paste the token from step 2)

## Environment Variables

Create a `.env` file for local development:

```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_ORG=sunrise-labs
BASE_URL=https://sunriselabs.io
```

**Never commit `.env` to the repository!**

## Testing the Full Pipeline

### Test Documentation Fetch

```bash
export GITHUB_TOKEN=your_token
node scripts/clone-documentation.js
```

This downloads all documentation to `temp/documentation/`.

### Test Full Build

```bash
export GITHUB_TOKEN=your_token
npm run build
```

### Test Deployment

Push to the `main` branch to trigger the GitHub Actions workflow:

```bash
git add .
git commit -m "Test deployment"
git push
```

Check the Actions tab to see the workflow run.

## Troubleshooting

### "No pages found"

**Cause**: No repositories have `documentation/` folders or they're empty.

**Solution**:
- Create `documentation/` folder in research repos
- Add markdown files with proper YAML frontmatter
- Ensure files follow Sunrise Labs Research Spec v1.0

### "Validation errors"

**Cause**: Markdown files missing required YAML frontmatter fields.

**Solution**: Check that all files have:
```yaml
---
id: unique-page-id
type: project|milestone|experiment|daily-note|insight|decision|synthesis
title: Page Title
date: YYYY-MM-DD
status: planned|active|in-progress|paused|completed|abandoned
lab: Sunrise Labs
authors:
  - Author Name
tags:
  - tag1
  - tag2
links:
  project: null
  experiment: null
  parent: null
  enables: []
  related: []
---
```

### GitHub Actions failing

**Checks**:
1. Verify `GITHUB_TOKEN` has correct permissions in Actions secrets
2. Check workflow logs in the Actions tab
3. Ensure `gh-pages` branch is created (happens automatically on first run)
4. Verify GitHub Pages is enabled in repository settings

### Site not updating

**Checks**:
1. Verify repository dispatch workflow is set up in research repos
2. Check that `SITE_GENERATOR_TOKEN` secret is set correctly
3. Ensure changes are in the `documentation/` folder
4. Check Actions tab for triggered workflows

## Manual Trigger

You can manually trigger a build from the GitHub Actions tab:

1. Go to Actions
2. Select "Build and Deploy Site" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Run workflow

## Monitoring

### Check Build Status

```bash
# View workflow runs
gh run list --workflow=build-deploy.yml

# View logs for specific run
gh run view <run-id> --log
```

### Check Deployed Site

Visit: https://sunriselabs.io

The homepage shows current statistics:
- Active Projects count
- Total Milestones
- Published Insights

## Next Steps

1. Add real research documentation to your repositories
2. Test the repository dispatch trigger
3. Monitor the first automated build
4. Verify the custom domain works correctly
5. Share the site with your team!

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review the main README.md
- Check GitHub Actions logs
- Consult Sunrise Labs Research Spec v1.0 documentation
