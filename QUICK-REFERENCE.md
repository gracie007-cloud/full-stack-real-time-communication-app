# Quick Reference: Dual Repository Workflow

## Current Setup ✅

- **Remotes:**
  - `release` → `KIIAREN/KIIAREN-Release` (self-host)
  - `saas` → `fentz26/KIIAREN-SAAS` (SaaS)
  
- **Branches:**
  - `release-main` → tracks `release/main`
  - `saas-main` → tracks `saas/main`

## Quick Commands

### Switch Between Repos

```bash
# Work on Release (self-host)
git checkout release-main
git pull release main

# Work on SAAS (production)
git checkout saas-main
git pull saas main
```

### Create Feature Branch

```bash
# For Release
git checkout release-main
git pull release main
git checkout -b feat/feature-name
git push release feat/feature-name

# For SAAS
git checkout saas-main
git pull saas main
git checkout -b feat/feature-name
git push saas feat/feature-name
```

### Sync Changes Between Repos

```bash
# Release → SAAS (cherry-pick)
git checkout saas-main
git pull saas main
git cherry-pick <commit-hash>
git push saas saas-main

# SAAS → Release (rare, cherry-pick)
git checkout release-main
git pull release main
git cherry-pick <commit-hash>
git push release release-main
```

## Current Status

Run this to check status:
```bash
git status
git branch -vv | grep -E "(release-main|saas-main)"
```

## Which Repo Am I Working On?

```bash
git branch --show-current
# Shows: release-main or saas-main
```

## Need Help?

See `WORKFLOW.md` for detailed workflow guide.