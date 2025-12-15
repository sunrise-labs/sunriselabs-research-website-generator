#!/bin/bash

# Script to add the notify-website workflow to all research repositories
# Usage: ./scripts/setup-research-repos.sh

ORG="sunrise-labs"
WORKFLOW_SOURCE=".github/workflows/EXAMPLE-notify-website.yml"
WORKFLOW_DEST=".github/workflows/notify-website.yml"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Get all repositories in the organization
echo "Fetching repositories from $ORG organization..."
repos=$(gh repo list $ORG --limit 1000 --json name --jq '.[].name')

echo "Found repositories. Select which ones should trigger website updates:"
echo ""

# Process each repository
for repo in $repos; do
    echo "----------------------------------------"
    echo "Repository: $repo"
    read -p "Add website notification workflow? (y/n): " response

    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "  Cloning $repo..."
        temp_dir=$(mktemp -d)
        gh repo clone "$ORG/$repo" "$temp_dir" -- --depth 1

        # Create .github/workflows directory if it doesn't exist
        mkdir -p "$temp_dir/.github/workflows"

        # Copy the workflow file
        cp "$WORKFLOW_SOURCE" "$temp_dir/$WORKFLOW_DEST"

        echo "  Committing and pushing..."
        cd "$temp_dir"
        git checkout -b add-website-notification
        git add .github/workflows/notify-website.yml
        git commit -m "Add workflow to notify website of documentation changes"
        git push origin add-website-notification

        # Create pull request
        gh pr create \
            --title "Add website notification workflow" \
            --body "This workflow triggers the sunriselabs.io website to rebuild when documentation changes are pushed to the main branch." \
            --base main \
            --head add-website-notification

        cd -
        rm -rf "$temp_dir"

        echo "  ✓ Pull request created for $repo"
    else
        echo "  Skipped $repo"
    fi
done

echo ""
echo "========================================="
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and merge the pull requests"
echo "2. Ensure organization secret SITE_GENERATOR_TOKEN is set"
echo "   (or add the secret to each repository individually)"
echo ""
echo "Organization secret setup:"
echo "  Go to: https://github.com/organizations/$ORG/settings/secrets/actions"
echo "  Create new secret: SITE_GENERATOR_TOKEN"
echo "  Value: Your GitHub personal access token"
echo "  Visibility: All repositories (or selected repositories)"
