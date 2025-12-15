# Website Integration with Research Skill

## Overview

The `sunriselabs-research` skill has been updated to **automatically** set up the website notification workflow when creating new research projects. This eliminates manual per-repository configuration!

## How It Works

### For New Projects

When you create a new research project using the `sunriselabs-research` skill and publish it to GitHub:

1. **Skill handles everything automatically:**
   - Creates the project structure with `documentation/` folder
   - Initializes Git repository
   - Publishes to GitHub
   - **Automatically adds `.github/workflows/notify-website.yml`**
   - Commits and pushes the workflow file

2. **You only need to do ONE thing:**
   - Add the `SITE_GENERATOR_TOKEN` secret to the repository (or use organization secret)

### One-Time Organization Setup (Recommended)

**Instead of adding the secret to each repository individually**, set it up once at the organization level:

1. Go to: `https://github.com/organizations/sunrise-labs/settings/secrets/actions`
2. Click "New organization secret"
3. Name: `SITE_GENERATOR_TOKEN`
4. Value: (your GitHub Personal Access Token with `repo` scope)
5. Repository access: "All repositories" or "Selected repositories"

**That's it!** Every new research repository created by the skill will automatically work with the website.

## Manual Setup (For Existing Repositories)

If you have existing research repositories that need website integration:

### Option 1: Use the Skill

The skill can add the workflow to existing projects too. Just ask it to:
```
"Add website notification to this repository"
```

### Option 2: Manual Copy

```bash
cd your-research-repo
mkdir -p .github/workflows
cp /path/to/sunriselabs-research-website-generator/.github/workflows/EXAMPLE-notify-website.yml \
   .github/workflows/notify-website.yml
git add .github/workflows/notify-website.yml
git commit -m "Add website notification workflow"
git push
```

## Token Permissions

The GitHub Personal Access Token needs:
- **repo**: Full control of private repositories
- **read:org**: Read organization membership (if using org-level secrets)

## Testing the Integration

After setup, test that it works:

1. Make a change to any file in `documentation/`
2. Commit and push:
   ```bash
   git add documentation/
   git commit -m "Test website notification"
   git push
   ```

3. Check the Actions tab in both repositories:
   - **Research repo**: Should show "Notify Website of Documentation Changes" workflow running
   - **Generator repo**: Should show "Build and Deploy Site" workflow triggered

4. After both complete, check `https://sunriselabs.io` to see your changes

## Summary: What You Need to Do

### For New Projects (Using the Skill)
1. ✅ Use `sunriselabs-research` skill to create project
2. ✅ Skill automatically adds website notification
3. ✅ Ensure SITE_GENERATOR_TOKEN is available (org secret recommended)
4. ✅ Done! Your documentation appears on sunriselabs.io automatically

### One-Time Organization Setup
1. ✅ Create GitHub Personal Access Token (once)
2. ✅ Add as organization secret `SITE_GENERATOR_TOKEN` (once)
3. ✅ All future research repos work automatically

### For Existing Projects
1. ✅ Add the workflow file (manual or via skill)
2. ✅ Ensure token secret is available
3. ✅ Push changes to trigger first build

## Troubleshooting

### Workflow doesn't trigger

**Check:**
- Workflow file is in `.github/workflows/notify-website.yml`
- Changes are in `documentation/` folder
- Pushed to `main` branch
- Secret `SITE_GENERATOR_TOKEN` exists and is accessible

### "Secret not found" error

**Solution:**
- If using repository secret: Add it in repo Settings → Secrets
- If using organization secret: Verify repository has access to it

### Website doesn't update

**Check:**
- Both workflows completed successfully (check Actions tabs)
- Changes are actually in `documentation/` folder
- Allow a few minutes for GitHub Pages to update
- Check the generator workflow logs for errors

## Benefits of This Approach

✅ **Zero manual setup** for new research projects
✅ **One secret** configured once at organization level
✅ **Automatic** website updates when documentation changes
✅ **No API calls** needed during regular research work
✅ **Scales effortlessly** to unlimited research projects

## Architecture Diagram

```
Research Repository (created by skill)
├── documentation/        # Your research pages
│   ├── 2024-01-15--project.md
│   ├── 2024-01-20--milestone.md
│   └── 2024-02-01--insight.md
├── .github/workflows/
│   └── notify-website.yml  # AUTO-ADDED BY SKILL ✨
└── (your code, data, etc.)

         ↓ (on push to main)

GitHub Actions: Repository Dispatch
         ↓

Website Generator Repository
├── .github/workflows/
│   └── build-deploy.yml    # Triggered automatically
├── src/generator/
│   └── (builds website)
└── dist/                   # Deployed to GitHub Pages

         ↓

sunriselabs.io (automatically updated)
```

## Next Steps

1. **Set up organization secret** (one time, recommended)
2. **Use the skill** to create new research projects
3. **Watch your documentation** appear automatically on sunriselabs.io!

For existing projects, you can either:
- Use the skill to add the workflow
- Copy the workflow file manually
- Re-create the project structure with the skill

The skill makes everything automatic! 🚀
