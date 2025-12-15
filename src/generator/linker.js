/**
 * Resolves internal page ID references to URLs
 */

/**
 * Generates a URL path for a page
 * @param {Object} page - Page object
 * @returns {string} URL path
 */
function getPageUrl(page) {
  if (!page) return null;

  // Homepage is special
  if (page.id === 'index' || page.type === 'index') {
    return '/index.html';
  }

  // All other pages go in /pages/
  return `/pages/${page.id}.html`;
}

/**
 * Resolves internal ID references in markdown content to URLs
 * @param {string} content - Raw markdown content
 * @param {Object} pageIndex - Map of page IDs to page objects
 * @returns {string} Content with resolved links
 */
function resolveInternalLinks(content, pageIndex) {
  if (!content) return content;

  // Match markdown links: [text](id) or [text](id "title")
  // This regex looks for links that don't start with http://, https://, /, or #
  const linkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;

  return content.replace(linkRegex, (match, text, target, title) => {
    // Skip if it's already a URL or anchor
    if (target.startsWith('http://') ||
        target.startsWith('https://') ||
        target.startsWith('/') ||
        target.startsWith('#') ||
        target.startsWith('mailto:')) {
      return match;
    }

    // Try to resolve as page ID
    const targetPage = pageIndex[target];
    if (targetPage) {
      const url = getPageUrl(targetPage);
      if (title) {
        return `[${text}](${url} "${title}")`;
      }
      return `[${text}](${url})`;
    }

    // If not found, warn and leave as-is
    console.warn(`Warning: Could not resolve internal link: ${target}`);
    return match;
  });
}

/**
 * Processes all pages to resolve their internal links
 * @param {Array} pages - Array of page objects
 * @param {Object} pageIndex - Map of page IDs to page objects
 * @returns {Array} Pages with resolved links
 */
function processAllLinks(pages, pageIndex) {
  return pages.map(page => {
    // Add URL property to page
    page.url = getPageUrl(page);

    // Resolve links in raw content
    if (page.rawContent) {
      page.rawContent = resolveInternalLinks(page.rawContent, pageIndex);
    }

    // Re-process HTML content with resolved links
    // Note: This requires re-running markdown parsing
    // For now, we'll handle this in the renderer

    return page;
  });
}

/**
 * Builds a sitemap of all pages
 * @param {Array} pages - Array of page objects
 * @param {string} baseUrl - Base URL of the site
 * @returns {Array} Sitemap entries
 */
function buildSitemap(pages, baseUrl = 'https://sunriselabs.io') {
  return pages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastmod: page.date,
    changefreq: page.status === 'completed' ? 'monthly' : 'weekly',
    priority: page.type === 'project' ? 0.9 : 0.7
  }));
}

/**
 * Generates breadcrumb navigation for a page
 * @param {Object} page - Page object
 * @param {Object} pageIndex - Map of page IDs to page objects
 * @returns {Array} Breadcrumb items
 */
function generateBreadcrumbs(page, pageIndex) {
  const breadcrumbs = [
    { title: 'Home', url: '/index.html' }
  ];

  // Add project to breadcrumb if this page links to one
  if (page.projectPage) {
    breadcrumbs.push({
      title: page.projectPage.title,
      url: page.projectPage.url
    });
  }

  // Add experiment if this is a daily note
  if (page.type === 'daily-note' && page.experimentPage) {
    breadcrumbs.push({
      title: page.experimentPage.title,
      url: page.experimentPage.url
    });
  }

  // Add parent if exists
  if (page.parentPage) {
    breadcrumbs.push({
      title: page.parentPage.title,
      url: page.parentPage.url
    });
  }

  // Add current page
  breadcrumbs.push({
    title: page.title,
    url: page.url,
    current: true
  });

  return breadcrumbs;
}

module.exports = {
  getPageUrl,
  resolveInternalLinks,
  processAllLinks,
  buildSitemap,
  generateBreadcrumbs
};
