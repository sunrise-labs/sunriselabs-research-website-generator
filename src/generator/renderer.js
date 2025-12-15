const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { marked } = require('marked');

/**
 * Registers Handlebars helpers for template rendering
 */
function registerHelpers() {
  // Capitalize helper
  Handlebars.registerHelper('capitalize', function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  });

  // Substring helper
  Handlebars.registerHelper('substring', function(str, start, end) {
    if (!str) return '';
    return str.substring(start, end);
  });

  // Or helper
  Handlebars.registerHelper('or', function(...args) {
    // Remove the last argument which is the options object
    const options = args.pop();
    return args.some(arg => arg);
  });

  // Equals helper
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Format date helper
  Handlebars.registerHelper('formatDate', function(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Join array helper
  Handlebars.registerHelper('join', function(arr, separator) {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.join(separator || ', ');
  });
}

/**
 * Registers Handlebars partials from the partials directory
 * @param {string} partialsDir - Path to partials directory
 */
function registerPartials(partialsDir) {
  if (!fs.existsSync(partialsDir)) {
    console.warn(`Partials directory not found: ${partialsDir}`);
    return;
  }

  const partialFiles = fs.readdirSync(partialsDir);

  for (const file of partialFiles) {
    if (file.endsWith('.hbs')) {
      const partialName = path.basename(file, '.hbs');
      const partialPath = path.join(partialsDir, file);
      const partialContent = fs.readFileSync(partialPath, 'utf8');
      Handlebars.registerPartial(partialName, partialContent);
    }
  }
}

/**
 * Compiles a Handlebars template from file
 * @param {string} templatePath - Path to template file
 * @returns {Function} Compiled template function
 */
function compileTemplate(templatePath) {
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  return Handlebars.compile(templateContent);
}

/**
 * Renders the homepage using aggregated data
 * @param {Object} aggregatedData - Data from aggregator
 * @param {string} templatePath - Path to index template
 * @returns {string} Rendered HTML
 */
function renderHomepage(aggregatedData, templatePath) {
  const template = compileTemplate(templatePath);
  return template(aggregatedData);
}

/**
 * Renders a single page using page data
 * @param {Object} page - Page object with frontmatter and content
 * @param {string} templatePath - Path to page template
 * @returns {string} Rendered HTML
 */
function renderPage(page, templatePath) {
  const template = compileTemplate(templatePath);

  // Re-render markdown content with resolved links
  if (page.rawContent) {
    page.content = marked(page.rawContent);
  }

  return template(page);
}

/**
 * Writes rendered HTML to a file
 * @param {string} html - Rendered HTML content
 * @param {string} outputPath - Path to write file
 */
function writeHtmlFile(html, outputPath) {
  const dir = path.dirname(outputPath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html, 'utf8');
}

/**
 * Copies static assets to dist directory
 * @param {string} sourceDir - Source directory for assets
 * @param {string} destDir - Destination directory
 */
function copyAssets(sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`Source directory not found: ${sourceDir}`);
    return;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const items = fs.readdirSync(sourceDir);

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyAssets(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

/**
 * Generates sitemap.xml
 * @param {Array} pages - Array of all pages
 * @param {string} baseUrl - Base URL of the site
 * @param {string} outputPath - Path to write sitemap
 */
function generateSitemap(pages, baseUrl, outputPath) {
  const urls = pages.map(page => {
    const priority = page.type === 'project' ? '0.9' : '0.7';
    const changefreq = page.status === 'completed' ? 'monthly' : 'weekly';

    return `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  fs.writeFileSync(outputPath, sitemap, 'utf8');
}

/**
 * Main rendering function
 * @param {Object} aggregatedData - Data from aggregator
 * @param {Object} config - Configuration object
 */
function renderAll(aggregatedData, config) {
  const {
    templatesDir,
    partialsDir,
    assetsDir,
    outputDir,
    baseUrl = 'https://sunriselabs.io'
  } = config;

  // Register helpers and partials
  registerHelpers();
  registerPartials(partialsDir);

  // Render homepage
  console.log('Rendering homepage...');
  const indexTemplatePath = path.join(templatesDir, 'layouts', 'index.hbs');
  const homepageHtml = renderHomepage(aggregatedData, indexTemplatePath);
  writeHtmlFile(homepageHtml, path.join(outputDir, 'index.html'));

  // Render individual pages
  console.log(`Rendering ${aggregatedData.pages.length} pages...`);
  const pageTemplatePath = path.join(templatesDir, 'layouts', 'page.hbs');

  for (const page of aggregatedData.pages) {
    const pageHtml = renderPage(page, pageTemplatePath);
    const outputPath = path.join(outputDir, page.url.substring(1)); // Remove leading /
    writeHtmlFile(pageHtml, outputPath);
  }

  // Copy assets
  console.log('Copying assets...');
  if (fs.existsSync(assetsDir)) {
    const destAssetsDir = path.join(outputDir, 'assets');
    copyAssets(assetsDir, destAssetsDir);
  }

  // Generate sitemap
  console.log('Generating sitemap...');
  generateSitemap(aggregatedData.pages, baseUrl, path.join(outputDir, 'sitemap.xml'));

  console.log(`✓ Site generation complete! ${aggregatedData.pages.length} pages created.`);
}

module.exports = {
  renderAll,
  renderHomepage,
  renderPage,
  writeHtmlFile,
  copyAssets,
  generateSitemap,
  registerHelpers,
  registerPartials,
  compileTemplate
};
