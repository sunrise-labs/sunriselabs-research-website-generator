#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { fetchAllDocumentation } = require('../../scripts/clone-documentation');
const { parseDirectory } = require('./parser');
const { aggregatePages } = require('./aggregator');
const { processAllLinks, generateBreadcrumbs } = require('./linker');
const { renderAll } = require('./renderer');

/**
 * Main build process
 */
async function build() {
  console.log('=== Sunrise Labs Research Website Generator ===\n');

  const startTime = Date.now();

  // Configuration
  const config = {
    org: process.env.GITHUB_ORG || 'sunrise-labs',
    token: process.env.GITHUB_TOKEN,
    baseUrl: process.env.BASE_URL || 'https://sunriselabs.io',
    rootDir: path.join(__dirname, '..', '..'),
  };

  config.tempDir = path.join(config.rootDir, 'temp', 'documentation');
  config.outputDir = path.join(config.rootDir, 'dist');
  config.templatesDir = path.join(config.rootDir, 'src', 'templates');
  config.partialsDir = path.join(config.templatesDir, 'partials');
  config.assetsDir = path.join(config.rootDir, 'src', 'assets');

  try {
    // Step 1: Fetch documentation from GitHub
    console.log('Step 1: Fetching documentation from GitHub...');
    let documentation;

    if (config.token) {
      documentation = await fetchAllDocumentation(config.org, config.token, config.tempDir);
    } else {
      console.log('No GITHUB_TOKEN provided. Using local documentation if available.');

      if (!fs.existsSync(config.tempDir)) {
        throw new Error(`No local documentation found at ${config.tempDir} and no GITHUB_TOKEN provided`);
      }

      // Load from local cache
      const metadataPath = path.join(config.tempDir, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        documentation = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        console.log(`Loaded cached documentation from ${metadataPath}`);
      } else {
        console.warn('Warning: No metadata.json found. Proceeding with directory scan...');
        documentation = {
          organization: config.org,
          fetchedAt: new Date().toISOString(),
          repositories: []
        };
      }
    }

    // Step 2: Parse markdown files
    console.log('\nStep 2: Parsing markdown files...');
    let allPages = [];

    // If we have documentation object with repositories
    if (documentation.repositories && documentation.repositories.length > 0) {
      for (const repo of documentation.repositories) {
        const repoDir = path.join(config.tempDir, repo.name);
        if (fs.existsSync(repoDir)) {
          const pages = parseDirectory(repoDir);
          console.log(`  Parsed ${pages.length} pages from ${repo.name}`);
          allPages.push(...pages);
        }
      }
    } else {
      // Fallback: scan temp directory for markdown files
      if (fs.existsSync(config.tempDir)) {
        allPages = parseDirectory(config.tempDir);
        console.log(`  Parsed ${allPages.length} pages from local files`);
      }
    }

    if (allPages.length === 0) {
      console.warn('\nWarning: No pages found to process!');
      console.log('This could mean:');
      console.log('  1. No repositories have documentation/ folders');
      console.log('  2. The documentation/ folders are empty');
      console.log('  3. There was an error fetching from GitHub');
      console.log('\nProceeding to generate site with empty content...');
    } else {
      console.log(`\n✓ Total pages parsed: ${allPages.length}`);
    }

    // Step 3: Aggregate and index pages
    console.log('\nStep 3: Aggregating and indexing pages...');
    const aggregated = aggregatePages(allPages);
    console.log(`  ✓ Indexed ${aggregated.totalPages} pages`);
    console.log(`  ✓ Projects: ${aggregated.statistics.totalProjects} (${aggregated.statistics.activeProjects} active)`);
    console.log(`  ✓ Milestones: ${aggregated.statistics.totalMilestones}`);
    console.log(`  ✓ Insights: ${aggregated.statistics.totalInsights}`);

    // Step 4: Process links and generate URLs
    console.log('\nStep 4: Processing links and generating URLs...');
    processAllLinks(aggregated.pages, aggregated.pageIndex);

    // Generate breadcrumbs for each page
    for (const page of aggregated.pages) {
      page.breadcrumbs = generateBreadcrumbs(page, aggregated.pageIndex);
    }
    console.log('  ✓ Links resolved and breadcrumbs generated');

    // Step 5: Render HTML
    console.log('\nStep 5: Rendering HTML...');
    renderAll(aggregated, {
      templatesDir: config.templatesDir,
      partialsDir: config.partialsDir,
      assetsDir: config.assetsDir,
      outputDir: config.outputDir,
      baseUrl: config.baseUrl
    });

    // Step 6: Create CNAME file for custom domain
    if (config.baseUrl && config.baseUrl !== 'https://sunriselabs.io') {
      const domain = config.baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const cnamePath = path.join(config.outputDir, 'CNAME');
      fs.writeFileSync(cnamePath, domain, 'utf8');
      console.log(`\n✓ CNAME file created for ${domain}`);
    }

    // Summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n=== Build Complete ===');
    console.log(`Time elapsed: ${elapsed}s`);
    console.log(`Output directory: ${config.outputDir}`);
    console.log(`Total pages generated: ${aggregated.totalPages + 1}`); // +1 for index
    console.log(`\nReady to deploy! 🚀`);

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build };
