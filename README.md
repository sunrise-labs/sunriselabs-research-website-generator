# Sunrise Labs Research Website Generator

Static site generator that builds the Sunrise Labs Research website from documentation across all organization repositories.

## Part of the Sunrise Labs Open-Research Framework

This repository is one of three interconnected components:

- **[sunriselabs-research-spec](https://github.com/sunrise-labs/sunriselabs-research-spec)** - Defines the documentation specification with 7 page types (project, milestone, experiment, daily-note, insight, decision, synthesis) using Markdown + YAML frontmatter
- **[sunriselabs-research-skill](https://github.com/sunrise-labs/sunriselabs-research-skill)** - Claude Code skill that guides researchers through creating documentation following the spec, with integrated Git repository management
- **[sunriselabs-research-website-generator](https://github.com/sunrise-labs/sunriselabs-research-website-generator)** (this repo) - Static site generator that automatically fetches documentation from GitHub repositories and renders them into a live website

**How they work together:** The spec defines the structure → the skill helps create compliant documentation → the generator renders it as a website.

## Overview

This generator:
- Fetches documentation from all `sunrise-labs` GitHub org repositories
- Converts Markdown files (following Sunrise Labs Research Spec v1.0) into HTML
- Deploys to GitHub Pages at sunriselabs.io
- Automatically rebuilds when documentation changes

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

```bash
export GITHUB_TOKEN=your_github_personal_access_token
export GITHUB_ORG=sunrise-labs
export BASE_URL=https://sunriselabs.io
```

### 3. Build Locally

```bash
npm run build
```

The generated site will be in the `dist/` directory.

## Architecture

### Core Components

- **parser.js**: Parses Markdown + validates YAML frontmatter against Sunrise Labs Research Spec v1.0
- **aggregator.js**: Indexes pages by type, builds relationships, and calculates statistics
- **linker.js**: Resolves internal ID references to URLs and generates breadcrumbs
- **renderer.js**: Generates HTML using Handlebars templates
- **clone-documentation.js**: Fetches documentation from all org repositories via GitHub API

### Project Structure

```
sunriselabs-research-website-generator/
├── .github/workflows/
│   ├── build-deploy.yml              # Main CI/CD workflow
│   └── EXAMPLE-notify-website.yml     # Template for research repos
├── src/
│   ├── generator/
│   │   ├── index.js                   # Main build script
│   │   ├── parser.js                  # Markdown + YAML parser
│   │   ├── aggregator.js              # Data aggregation
│   │   ├── linker.js                  # Link resolution
│   │   └── renderer.js                # HTML generation
│   └── templates/
│       ├── layouts/
│       │   ├── index.hbs              # Homepage template
│       │   └── page.hbs               # Research page template
│       └── partials/
│           ├── nav.hbs                # Navigation
│           ├── sidebar.hbs            # Page metadata sidebar
│           ├── project-card.hbs       # Project card component
│           └── insight-card.hbs       # Insight card component
├── scripts/
│   └── clone-documentation.js         # GitHub API integration
├── dist/                              # Build output (generated)
│   ├── index.html
│   ├── pages/*.html
│   ├── assets/
│   │   ├── css/main.css
│   │   └── js/theme-toggle.js
│   └── sitemap.xml
└── package.json
```

## GitHub Actions Setup

### 1. Create the Repository

1. Create a new repository: `sunrise-labs/sunriselabs-research-website-generator`
2. Push this code to the repository
3. Enable GitHub Pages in repository settings:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

### 2. Configure Custom Domain

1. Add `CNAME` record in your DNS:
   ```
   CNAME sunriselabs.io → sunrise-labs.github.io
   ```

2. The workflow automatically creates a `CNAME` file in the deployment

### 3. Set Up Repository Dispatch

For each research repository that should trigger website rebuilds:

1. Copy `.github/workflows/EXAMPLE-notify-website.yml` to the research repo:
   ```bash
   cp .github/workflows/EXAMPLE-notify-website.yml \
      /path/to/research-repo/.github/workflows/notify-website.yml
   ```

2. Create a Personal Access Token with `repo` scope

3. Add the token as a repository secret named `SITE_GENERATOR_TOKEN` to each research repo

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token with `read:org` and `repo` permissions | - | Yes (in CI) |
| `GITHUB_ORG` | GitHub organization name | `sunrise-labs` | No |
| `BASE_URL` | Base URL for the website | `https://sunriselabs.io` | No |

## Local Development

### Testing with Local Documentation

1. Place markdown files in `temp/documentation/`:
   ```
   temp/documentation/
   └── repo-name/
       ├── 2024-01-15--project.md
       ├── 2024-02-01--milestone.md
       └── 2024-03-10--insight.md
   ```

2. Run the build:
   ```bash
   npm run build
   ```

3. Serve the site locally:
   ```bash
   npx http-server dist -p 8000
   ```

4. Visit http://localhost:8000

### Fetching from GitHub

```bash
GITHUB_TOKEN=your_token node scripts/clone-documentation.js
```

This downloads all documentation to `temp/documentation/`.

## Page Types

The generator supports all Sunrise Labs Research Spec v1.0 page types:

- **project**: Research project overview
- **milestone**: Capability increment
- **experiment**: Falsifiable test
- **daily-note**: Session log
- **insight**: Generalizable learning
- **decision**: Irreversible commitment with rationale
- **synthesis**: Capstone integration

## Features

- ✅ Automatic builds triggered by documentation changes
- ✅ YAML frontmatter validation
- ✅ Internal link resolution (page ID → URL)
- ✅ Breadcrumb navigation
- ✅ Dark/light theme support
- ✅ Responsive design
- ✅ SEO-friendly sitemap generation
- ✅ Statistics and aggregation
- ✅ Tag and status filtering

## Troubleshooting

### Build fails with "No pages found"

- Check that repositories have a `documentation/` folder
- Verify markdown files have proper YAML frontmatter
- Ensure `GITHUB_TOKEN` has correct permissions

### GitHub Actions not triggering

- Verify the `SITE_GENERATOR_TOKEN` is set in research repos
- Check that the workflow file is in `.github/workflows/`
- Ensure changes are pushed to `documentation/` folder

### Pages not deploying

- Check GitHub Pages settings in repository
- Verify `gh-pages` branch exists after workflow runs
- Check workflow logs for deployment errors

## Contributing

This generator follows the Sunrise Labs Research Spec v1.0. Any changes to the spec should be reflected in the parser validation rules.

## License

MIT
