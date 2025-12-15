const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

/**
 * Fetches all repositories from a GitHub organization
 * @param {Octokit} octokit - Authenticated Octokit instance
 * @param {string} org - Organization name
 * @returns {Promise<Array>} Array of repository objects
 */
async function getOrgRepositories(octokit, org) {
  try {
    const repos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await octokit.repos.listForOrg({
        org,
        type: 'public',
        per_page: 100,
        page
      });

      repos.push(...response.data);
      hasMore = response.data.length === 100;
      page++;
    }

    console.log(`Found ${repos.length} repositories in ${org} organization`);
    return repos;
  } catch (error) {
    console.error(`Error fetching repositories: ${error.message}`);
    throw error;
  }
}

/**
 * Checks if a repository has a documentation folder
 * @param {Octokit} octokit - Authenticated Octokit instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - Path to check (default: 'documentation')
 * @returns {Promise<boolean>} True if documentation folder exists
 */
async function hasDocumentationFolder(octokit, owner, repo, folderPath = 'documentation') {
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path: folderPath
    });
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Recursively fetches all markdown files from a directory in a repository
 * @param {Octokit} octokit - Authenticated Octokit instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - Path to directory
 * @returns {Promise<Array>} Array of file objects
 */
async function getMarkdownFiles(octokit, owner, repo, folderPath = 'documentation') {
  const files = [];

  async function traverse(currentPath) {
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: currentPath
      });

      const contents = Array.isArray(response.data) ? response.data : [response.data];

      for (const item of contents) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          // Fetch file content
          const fileResponse = await octokit.repos.getContent({
            owner,
            repo,
            path: item.path
          });

          const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');

          files.push({
            path: item.path,
            name: item.name,
            content,
            sha: item.sha,
            repo,
            downloadUrl: item.download_url
          });
        } else if (item.type === 'dir') {
          // Recursively traverse subdirectories
          await traverse(item.path);
        }
      }
    } catch (error) {
      console.error(`Error fetching contents from ${currentPath}:`, error.message);
    }
  }

  await traverse(folderPath);
  return files;
}

/**
 * Fetches all documentation files from all repositories in an organization
 * @param {string} org - Organization name
 * @param {string} token - GitHub personal access token
 * @param {string} outputDir - Directory to save documentation files
 * @returns {Promise<Object>} Object containing all documentation files organized by repository
 */
async function fetchAllDocumentation(org, token, outputDir) {
  const octokit = new Octokit({ auth: token });

  console.log(`Fetching repositories from ${org}...`);
  const repos = await getOrgRepositories(octokit, org);

  const documentation = {
    organization: org,
    fetchedAt: new Date().toISOString(),
    repositories: []
  };

  for (const repo of repos) {
    console.log(`\nChecking ${repo.name} for documentation...`);

    const hasDocs = await hasDocumentationFolder(octokit, org, repo.name);

    if (!hasDocs) {
      console.log(`  No documentation folder found in ${repo.name}`);
      continue;
    }

    console.log(`  Found documentation folder in ${repo.name}`);
    const markdownFiles = await getMarkdownFiles(octokit, org, repo.name);

    if (markdownFiles.length > 0) {
      console.log(`  Fetched ${markdownFiles.length} markdown files from ${repo.name}`);

      documentation.repositories.push({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
        files: markdownFiles
      });

      // Save files to disk
      if (outputDir) {
        const repoDir = path.join(outputDir, repo.name);
        if (!fs.existsSync(repoDir)) {
          fs.mkdirSync(repoDir, { recursive: true });
        }

        for (const file of markdownFiles) {
          const filePath = path.join(repoDir, file.name);
          fs.writeFileSync(filePath, file.content, 'utf8');
        }
      }
    } else {
      console.log(`  No markdown files found in ${repo.name}/documentation`);
    }
  }

  console.log(`\n✓ Documentation fetch complete!`);
  console.log(`  Total repositories with documentation: ${documentation.repositories.length}`);
  console.log(`  Total markdown files: ${documentation.repositories.reduce((sum, r) => sum + r.files.length, 0)}`);

  return documentation;
}

/**
 * Main function to run as script
 */
async function main() {
  const org = process.env.GITHUB_ORG || 'sunrise-labs';
  const token = process.env.GITHUB_TOKEN;
  const outputDir = process.env.OUTPUT_DIR || path.join(__dirname, '..', 'temp', 'documentation');

  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is required');
    console.error('Usage: GITHUB_TOKEN=your_token node scripts/clone-documentation.js');
    process.exit(1);
  }

  try {
    const documentation = await fetchAllDocumentation(org, token, outputDir);

    // Save metadata
    const metadataPath = path.join(outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(documentation, null, 2), 'utf8');
    console.log(`\nMetadata saved to: ${metadataPath}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchAllDocumentation,
  getOrgRepositories,
  hasDocumentationFolder,
  getMarkdownFiles
};
