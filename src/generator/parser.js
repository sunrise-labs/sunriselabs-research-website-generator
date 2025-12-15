const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const VALID_TYPES = ['project', 'milestone', 'experiment', 'daily-note', 'insight', 'decision', 'synthesis'];
const VALID_STATUSES = ['planned', 'active', 'in-progress', 'paused', 'completed', 'abandoned'];

/**
 * Validates YAML frontmatter against Sunrise Labs Research Spec v1.0
 */
function validateFrontmatter(data, filePath) {
  const errors = [];

  // Required fields
  if (!data.id) errors.push('Missing required field: id');
  if (!data.type) errors.push('Missing required field: type');
  if (!data.title) errors.push('Missing required field: title');
  if (!data.date) errors.push('Missing required field: date');
  if (!data.status) errors.push('Missing required field: status');
  if (!data.lab) errors.push('Missing required field: lab');
  if (!data.authors || !Array.isArray(data.authors) || data.authors.length === 0) {
    errors.push('Missing or invalid required field: authors (must be non-empty array)');
  }
  if (!data.tags || !Array.isArray(data.tags)) {
    errors.push('Missing or invalid required field: tags (must be array)');
  }
  if (!data.links || typeof data.links !== 'object') {
    errors.push('Missing or invalid required field: links (must be object)');
  }

  // Validate type
  if (data.type && !VALID_TYPES.includes(data.type)) {
    errors.push(`Invalid type: ${data.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Validate status
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Invalid status: ${data.status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  // Validate and normalize date format (YYYY-MM-DD)
  if (data.date) {
    // gray-matter may parse dates as Date objects, convert back to string
    if (data.date instanceof Date) {
      const year = data.date.getFullYear();
      const month = String(data.date.getMonth() + 1).padStart(2, '0');
      const day = String(data.date.getDate()).padStart(2, '0');
      data.date = `${year}-${month}-${day}`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors.push(`Invalid date format: ${data.date}. Must be YYYY-MM-DD`);
    }
  }

  // Validate links structure
  if (data.links) {
    const validLinkFields = ['project', 'experiment', 'parent', 'enables', 'related'];
    for (const key of Object.keys(data.links)) {
      if (!validLinkFields.includes(key)) {
        errors.push(`Invalid links field: ${key}. Valid fields: ${validLinkFields.join(', ')}`);
      }
    }

    // Validate enables and related are arrays
    if (data.links.enables && !Array.isArray(data.links.enables)) {
      errors.push('links.enables must be an array');
    }
    if (data.links.related && !Array.isArray(data.links.related)) {
      errors.push('links.related must be an array');
    }

    // Type-specific link validation
    if (['milestone', 'experiment', 'synthesis'].includes(data.type)) {
      if (!data.links.project) {
        errors.push(`${data.type} pages require links.project to be set`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors in ${filePath}:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }

  return true;
}

/**
 * Validates required sections in markdown content based on page type
 */
function validateRequiredSections(type, content, filePath) {
  const requiredSections = {
    project: ['Objective', 'Research Scope', 'Key Questions'],
    milestone: ['Milestone Summary', 'Outcome', 'Enables'],
    experiment: ['Research Question', 'Hypothesis', 'Method'],
    'daily-note': ['Focus', 'Actions', 'Observations'],
    insight: ['Insight', 'Evidence'],
    decision: ['Decision', 'Rationale'],
    synthesis: ['What Was Established', 'Key Decisions', 'Resulting System Posture']
  };

  const required = requiredSections[type];
  if (!required) return true;

  const missing = [];
  for (const section of required) {
    const regex = new RegExp(`^##\\s+${section}`, 'm');
    if (!regex.test(content)) {
      missing.push(section);
    }
  }

  if (missing.length > 0) {
    console.warn(`Warning: ${filePath} is missing required sections: ${missing.join(', ')}`);
  }

  return true;
}

/**
 * Parses a single Markdown file with YAML frontmatter
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} Parsed page object with frontmatter and HTML content
 */
function parseMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  // Validate frontmatter
  validateFrontmatter(data, filePath);

  // Validate required sections
  validateRequiredSections(data.type, content, filePath);

  // Convert markdown to HTML
  const htmlContent = marked(content);

  return {
    ...data,
    content: htmlContent,
    rawContent: content,
    filePath,
    fileName: path.basename(filePath)
  };
}

/**
 * Parses all markdown files in a directory
 * @param {string} dirPath - Path to directory containing markdown files
 * @returns {Array} Array of parsed page objects
 */
function parseDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const pages = [];
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively parse subdirectories
      pages.push(...parseDirectory(fullPath));
    } else if (file.endsWith('.md')) {
      try {
        const page = parseMarkdownFile(fullPath);
        pages.push(page);
      } catch (error) {
        console.error(`Error parsing ${fullPath}:`, error.message);
        // Continue parsing other files even if one fails
      }
    }
  }

  return pages;
}

module.exports = {
  parseMarkdownFile,
  parseDirectory,
  validateFrontmatter,
  validateRequiredSections
};
