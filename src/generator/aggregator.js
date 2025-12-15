/**
 * Aggregates and indexes parsed pages for site generation
 */

/**
 * Creates an index of all pages by their ID
 * @param {Array} pages - Array of parsed page objects
 * @returns {Object} Map of page IDs to page objects
 */
function indexById(pages) {
  const index = {};
  for (const page of pages) {
    if (index[page.id]) {
      console.warn(`Warning: Duplicate page ID found: ${page.id}`);
      console.warn(`  Existing: ${index[page.id].filePath}`);
      console.warn(`  New: ${page.filePath}`);
    }
    index[page.id] = page;
  }
  return index;
}

/**
 * Groups pages by their type
 * @param {Array} pages - Array of parsed page objects
 * @returns {Object} Map of page types to arrays of pages
 */
function groupByType(pages) {
  const groups = {
    project: [],
    milestone: [],
    experiment: [],
    'daily-note': [],
    insight: [],
    decision: [],
    synthesis: []
  };

  for (const page of pages) {
    if (groups[page.type]) {
      groups[page.type].push(page);
    } else {
      console.warn(`Warning: Unknown page type: ${page.type} in ${page.filePath}`);
    }
  }

  // Sort each group by date (newest first)
  for (const type in groups) {
    groups[type].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return groups;
}

/**
 * Builds relationships between pages based on their links
 * @param {Array} pages - Array of parsed page objects
 * @param {Object} pageIndex - Map of page IDs to page objects
 * @returns {Object} Enhanced page index with relationship data
 */
function buildRelationships(pages, pageIndex) {
  const enhanced = { ...pageIndex };

  for (const page of pages) {
    const enhancedPage = enhanced[page.id];

    // Initialize relationship arrays
    enhancedPage.linkedFrom = {
      milestones: [],
      experiments: [],
      insights: [],
      decisions: [],
      synthesis: [],
      related: []
    };

    // Build forward relationships
    if (page.links) {
      // Link to project
      if (page.links.project && pageIndex[page.links.project]) {
        enhancedPage.projectPage = pageIndex[page.links.project];
      }

      // Link to experiment
      if (page.links.experiment && pageIndex[page.links.experiment]) {
        enhancedPage.experimentPage = pageIndex[page.links.experiment];
      }

      // Link to parent
      if (page.links.parent && pageIndex[page.links.parent]) {
        enhancedPage.parentPage = pageIndex[page.links.parent];
      }

      // Resolve enables links
      if (page.links.enables) {
        enhancedPage.enablesPages = page.links.enables
          .map(id => pageIndex[id])
          .filter(Boolean);
      }

      // Resolve related links
      if (page.links.related) {
        enhancedPage.relatedPages = page.links.related
          .map(id => pageIndex[id])
          .filter(Boolean);
      }
    }
  }

  // Build reverse relationships (what links to this page)
  for (const page of pages) {
    if (page.links) {
      // Track what links to each project
      if (page.links.project && enhanced[page.links.project]) {
        const projectPage = enhanced[page.links.project];
        if (page.type === 'milestone') {
          projectPage.linkedFrom.milestones.push(page);
        } else if (page.type === 'experiment') {
          projectPage.linkedFrom.experiments.push(page);
        } else if (page.type === 'insight') {
          projectPage.linkedFrom.insights.push(page);
        } else if (page.type === 'decision') {
          projectPage.linkedFrom.decisions.push(page);
        } else if (page.type === 'synthesis') {
          projectPage.linkedFrom.synthesis.push(page);
        }
      }

      // Track related page backlinks
      if (page.links.related) {
        for (const relatedId of page.links.related) {
          if (enhanced[relatedId]) {
            enhanced[relatedId].linkedFrom.related.push(page);
          }
        }
      }
    }
  }

  return enhanced;
}

/**
 * Calculates site-wide statistics
 * @param {Object} groups - Pages grouped by type
 * @returns {Object} Statistics object
 */
function calculateStatistics(groups) {
  return {
    totalProjects: groups.project.length,
    activeProjects: groups.project.filter(p => ['active', 'in-progress'].includes(p.status)).length,
    completedProjects: groups.project.filter(p => p.status === 'completed').length,
    totalMilestones: groups.milestone.length,
    totalExperiments: groups.experiment.length,
    totalInsights: groups.insight.length,
    totalDecisions: groups.decision.length,
    totalDailyNotes: groups['daily-note'].length,
    totalSyntheses: groups.synthesis.length
  };
}

/**
 * Gets the latest items for homepage display
 * @param {Object} groups - Pages grouped by type
 * @returns {Object} Latest items
 */
function getLatestItems(groups) {
  return {
    latestProjects: groups.project
      .filter(p => ['active', 'in-progress', 'completed'].includes(p.status))
      .slice(0, 10),
    latestInsights: groups.insight.slice(0, 6),
    latestMilestones: groups.milestone.slice(0, 6),
    latestExperiments: groups.experiment.slice(0, 6)
  };
}

/**
 * Main aggregation function
 * @param {Array} pages - Array of parsed page objects
 * @returns {Object} Aggregated data structure
 */
function aggregatePages(pages) {
  const pageIndex = indexById(pages);
  const groups = groupByType(pages);
  const enhancedIndex = buildRelationships(pages, pageIndex);
  const statistics = calculateStatistics(groups);
  const latest = getLatestItems(groups);

  return {
    pages,
    pageIndex: enhancedIndex,
    groups,
    statistics,
    latest,
    totalPages: pages.length
  };
}

module.exports = {
  aggregatePages,
  indexById,
  groupByType,
  buildRelationships,
  calculateStatistics,
  getLatestItems
};
