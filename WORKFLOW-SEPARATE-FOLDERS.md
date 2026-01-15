# Workflow: Separate Folders for SAAS and Release

This document explains how to work with KIIAREN using two separate folders.

## Folder Structure

```
/home/fentz/Documents/KIIAREN/
├── KIIAREN-Release/    # Self-hosted open source edition
│   └── (tracks KIIAREN/KIIAREN-Release)
│
└── KIIAREN-SAAS/      # Private SaaS edition
    └── (tracks fentz26/KIIAREN-SAAS)
```

## Benefits of Separate Folders

✅ **Easier to understand** - Clear which repo you're working on  
✅ **No branch switching** - Each folder is dedicated to one repo  
✅ **Can work simultaneously** - Open both in IDE side-by-side  
✅ **Less confusion** - No need to remember which branch/remote  
✅ **Independent** - Changes in one don't affect the other  

## Daily Workflow

### Working on KIIAREN-Release (Self-Host)

```bash
cd /home/fentz/Documents/KIIAREN-Release

# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feat/my-feature

# Make changes, commit
git add .
git commit -m "feat: my feature"

# Push to Release repo
git push origin feat/my-feature

# Create PR in KIIAREN/KIIAREN-Release
```

### Working on KIIAREN-SAAS (SaaS)

```bash
cd /home/fentz/Documents/KIIAREN-SAAS

# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feat/my-saas-feature

# Make changes, commit
git add .
git commit -m "feat: my SaaS feature"

# Push to SAAS repo
git push origin feat/my-saas-feature

# Create PR in fentz26/KIIAREN-SAAS
```

## Syncing Changes Between Repos

### Release → SAAS (Common)

When you make changes in Release that should also go to SAAS:

```bash
# 1. Make changes in Release
cd /home/fentz/Documents/KIIAREN/KIIAREN-Release
git checkout -b feat/shared-feature
# ... make changes ...
git commit -m "feat: shared feature"
git push origin feat/shared-feature
# Merge PR in Release repo

# 2. Get commit hash from Release PR
COMMIT_HASH="abc123..."

# 3. Cherry-pick to SAAS
cd /home/fentz/Documents/KIIAREN/KIIAREN-SAAS
git pull origin main
git checkout -b feat/shared-feature-saas
git cherry-pick $COMMIT_HASH
# Resolve conflicts if any (SAAS may have different code)
git push origin feat/shared-feature-saas
# Create PR in SAAS repo
```

### SAAS → Release (Rare)

Usually SAAS-specific changes shouldn't go to Release, but if needed:

```bash
# Same process, but reverse
cd /home/fentz/Documents/KIIAREN-SAAS
# ... make changes ...
COMMIT_HASH="xyz789..."

cd /home/fentz/Documents/KIIAREN-Release
git pull origin main
git checkout -b feat/feature-from-saas
git cherry-pick $COMMIT_HASH
git push origin feat/feature-from-saas
```

## Quick Commands

### Check which folder you're in

```bash
pwd
# Shows: /home/fentz/Documents/KIIAREN-Release or KIIAREN-SAAS
```

### Update both folders

```bash
# Update Release
cd /home/fentz/Documents/KIIAREN-Release && git pull origin main

# Update SAAS
cd /home/fentz/Documents/KIIAREN-SAAS && git pull origin main
```

### Compare folders

```bash
# See differences between Release and SAAS
diff -r /home/fentz/Documents/KIIAREN-Release /home/fentz/Documents/KIIAREN-SAAS \
  --exclude='.git' --exclude='node_modules' --exclude='.next'
```

## IDE Setup

### VS Code / Cursor

You can open both folders in the same workspace:

1. File → Open Folder → Select `KIIAREN-Release`
2. File → Add Folder to Workspace → Select `KIIAREN-SAAS`

Or use separate windows:
- Window 1: `KIIAREN-Release`
- Window 2: `KIIAREN-SAAS`

### Environment Variables

**KIIAREN-Release** (`.env.local`):
```bash
# Flexible backend options
KIIAREN_DB_TYPE=convex|postgres|sqlite
KIIAREN_REALTIME_TYPE=convex|ws-nats|ws-redis|none
KIIAREN_SEARCH_TYPE=pg_fts|meilisearch|typesense|convex_search|none
```

**KIIAREN-SAAS** (`.env.local`):
```bash
# Convex only
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=prod:notable-mouse-667
SITE_URL=https://auth.kiiaren.com
```

## Common Tasks

### Starting work on Release

```bash
cd /home/fentz/Documents/KIIAREN/KIIAREN-Release
git pull origin main
git checkout -b feat/my-feature
# Start coding...
```

### Starting work on SAAS

```bash
cd /home/fentz/Documents/KIIAREN/KIIAREN-SAAS
git pull origin main
git checkout -b feat/my-feature
# Start coding...
```

### Syncing a bug fix

```bash
# Fix in Release
cd /home/fentz/Documents/KIIAREN/KIIAREN-Release
git checkout -b fix/bug-name
# Fix bug
git commit -m "fix: bug description"
git push origin fix/bug-name
# Merge PR

# Cherry-pick to SAAS
cd /home/fentz/Documents/KIIAREN/KIIAREN-SAAS
git pull origin main
git checkout -b fix/bug-name-saas
git cherry-pick <commit-hash>
git push origin fix/bug-name-saas
```

## Troubleshooting

### Wrong folder?

```bash
# Check current folder
pwd

# Check git remote
git remote get-url origin
```

### Need to reset a folder?

```bash
cd /home/fentz/Documents/KIIAREN/KIIAREN-Release  # or KIIAREN-SAAS
git fetch origin
git reset --hard origin/main
```

### Folder out of sync?

```bash
cd /home/fentz/Documents/KIIAREN/KIIAREN-Release  # or KIIAREN-SAAS
git pull origin main
```

## Best Practices

1. **Always pull before starting work**
   ```bash
   git pull origin main
   ```

2. **Use descriptive branch names**
   - `feat/feature-name` for features
   - `fix/bug-name` for bug fixes
   - `chore/task-name` for chores

3. **Keep folders separate**
   - Don't copy files manually between folders
   - Use git cherry-pick for syncing

4. **Test before pushing**
   - Run tests locally
   - Check linting
   - Verify build works

5. **Document differences**
   - If code differs between Release and SAAS, document why
   - Use comments to explain SAAS-specific changes