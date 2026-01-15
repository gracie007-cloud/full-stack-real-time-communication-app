# Local Development Workflow for Dual Repositories

This guide explains how to work with both KIIAREN-Release and KIIAREN-SAAS repositories from a single local folder.

## Git Setup

### Remotes

- `origin` → `KIIAREN/KIIAREN` (legacy, may not be used)
- `release` → `KIIAREN/KIIAREN-Release` (self-hosted open source)
- `saas` → `fentz26/KIIAREN-SAAS` (private SaaS)

### Branches

- `main` → tracks `origin/main` (legacy)
- `release-main` → tracks `release/main` (KIIAREN-Release)
- `saas-main` → tracks `saas/main` (KIIAREN-SAAS)

## Daily Workflow

### Working on KIIAREN-Release (Self-Host)

```bash
# Switch to Release branch
git checkout release-main

# Pull latest changes
git pull release main

# Create feature branch
git checkout -b feat/my-feature

# Make changes, commit
git add .
git commit -m "feat: my feature"

# Push to Release repo
git push release feat/my-feature

# Create PR in KIIAREN/KIIAREN-Release
```

### Working on KIIAREN-SAAS (SaaS)

```bash
# Switch to SAAS branch
git checkout saas-main

# Pull latest changes
git pull saas main

# Create feature branch
git checkout -b feat/my-saas-feature

# Make changes, commit
git add .
git commit -m "feat: my SaaS feature"

# Push to SAAS repo
git push saas feat/my-saas-feature

# Create PR in fentz26/KIIAREN-SAAS
```

### Syncing Shared Changes

When changes are made in Release that should also go to SAAS:

```bash
# 1. Make changes in Release
git checkout release-main
git checkout -b feat/shared-feature
# ... make changes ...
git commit -m "feat: shared feature"
git push release feat/shared-feature
# Merge PR in Release repo

# 2. Cherry-pick to SAAS
git checkout saas-main
git pull saas main
git cherry-pick <commit-hash>  # or cherry-pick range

# 3. Resolve conflicts if any (SAAS may have different code)
# 4. Push to SAAS
git push saas saas-main
```

### Syncing SAAS → Release (Rare)

Usually SAAS-specific changes shouldn't go to Release, but if needed:

```bash
# Same process as above, but reverse
git checkout saas-main
# ... make changes ...
git checkout release-main
git cherry-pick <commit-hash>
```

## Branch Management

### Creating New Feature Branches

**For Release:**
```bash
git checkout release-main
git pull release main
git checkout -b feat/feature-name
# Work on feature
git push release feat/feature-name
```

**For SAAS:**
```bash
git checkout saas-main
git pull saas main
git checkout -b feat/feature-name
# Work on feature
git push saas feat/feature-name
```

### Updating Branches

**Update Release branch:**
```bash
git checkout release-main
git pull release main
```

**Update SAAS branch:**
```bash
git checkout saas-main
git pull saas main
```

## Common Scenarios

### Scenario 1: Working on Release Feature

```bash
git checkout release-main
git pull release main
git checkout -b feat/flexible-backend
# Make changes
git add .
git commit -m "feat: add flexible backend options"
git push release feat/flexible-backend
```

### Scenario 2: Working on SAAS Feature (Convex-only)

```bash
git checkout saas-main
git pull saas main
git checkout -b feat/hardcode-convex
# Make changes (remove provider selection)
git add .
git commit -m "feat: hardcode Convex as only provider"
git push saas feat/hardcode-convex
```

### Scenario 3: Syncing Bug Fix from Release to SAAS

```bash
# 1. Fix bug in Release
git checkout release-main
git checkout -b fix/bug-name
# Fix bug
git commit -m "fix: bug description"
git push release fix/bug-name
# Merge PR in Release

# 2. Get commit hash from Release PR
COMMIT_HASH="abc123..."

# 3. Cherry-pick to SAAS
git checkout saas-main
git pull saas main
git cherry-pick $COMMIT_HASH
# Resolve conflicts if any
git push saas saas-main
```

## Checking Current State

### Which branch am I on?
```bash
git branch --show-current
```

### What remotes are configured?
```bash
git remote -v
```

### What's the status?
```bash
git status
```

### Compare Release vs SAAS
```bash
git diff release-main saas-main
```

## Environment Variables

### Release (Self-Host)
```bash
# Flexible backend options
KIIAREN_DB_TYPE=convex|postgres|sqlite
KIIAREN_REALTIME_TYPE=convex|ws-nats|ws-redis|none
KIIAREN_SEARCH_TYPE=pg_fts|meilisearch|typesense|convex_search|none
# ... other backend configs
```

### SAAS (Production)
```bash
# Convex only
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=prod:notable-mouse-667
SITE_URL=https://auth.kiiaren.com
# No provider selection variables
```

## Troubleshooting

### Branch is behind remote
```bash
git checkout release-main  # or saas-main
git pull release main     # or saas main
```

### Wrong remote configured
```bash
# Check current branch tracking
git branch -vv

# Update tracking
git branch --set-upstream-to=release/main release-main
git branch --set-upstream-to=saas/main saas-main
```

### Need to reset to remote state
```bash
git checkout release-main  # or saas-main
git fetch release          # or saas
git reset --hard release/main  # or saas/main
```

### Merge conflicts when cherry-picking
```bash
# Resolve conflicts manually
git cherry-pick --continue
# Or abort
git cherry-pick --abort
```

## Best Practices

1. **Always pull before creating new branches**
   ```bash
   git checkout release-main && git pull release main
   ```

2. **Keep branches focused**
   - One feature per branch
   - Clear commit messages

3. **Test before pushing**
   - Run tests locally
   - Check linting
   - Verify build works

4. **Use descriptive branch names**
   - `feat/feature-name` for features
   - `fix/bug-name` for bug fixes
   - `chore/task-name` for chores

5. **Sync regularly**
   - Pull latest changes before starting work
   - Keep branches up to date

6. **Document differences**
   - If code differs between Release and SAAS, document why
   - Use comments to explain SAAS-specific changes

## Quick Reference

| Task | Command |
|------|---------|
| Switch to Release | `git checkout release-main` |
| Switch to SAAS | `git checkout saas-main` |
| Pull Release | `git pull release main` |
| Pull SAAS | `git pull saas main` |
| Push to Release | `git push release <branch>` |
| Push to SAAS | `git push saas <branch>` |
| Cherry-pick | `git cherry-pick <commit>` |
| Check status | `git status` |
| View remotes | `git remote -v` |