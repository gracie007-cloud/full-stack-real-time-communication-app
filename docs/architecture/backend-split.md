# Backend Architecture Split: SAAS vs Release

This document explains the architectural differences between KIIAREN-SAAS and KIIAREN-Release repositories.

## Overview

- **KIIAREN-SAAS** (private): Hardcoded Convex-only backend
- **KIIAREN-Release** (open source): Flexible backend with multiple options

## KIIAREN-SAAS Architecture

### Backend: Convex Only

- **Database:** Convex (managed)
- **Realtime:** Convex native subscriptions
- **Search:** Convex search
- **Storage:** Convex `_storage`

### Code Characteristics

- No provider selection logic
- No `NEXT_PUBLIC_KIIAREN_PROVIDER` variable
- Direct Convex usage (simplified)
- Smaller bundle size
- Single backend path

### Environment Variables

```bash
NEXT_PUBLIC_CONVEX_URL=https://...      # Required
CONVEX_DEPLOYMENT=prod:notable-mouse-667 # Required
SITE_URL=https://auth.kiiaren.com      # Required
# OAuth credentials (optional)
```

## KIIAREN-Release Architecture

### Flexible Backend Options

Users configure three independent choices:

#### A. Database (Source of Truth)

| Option | Use Case | Status |
|--------|----------|--------|
| **Convex** | Managed backend, easiest setup | ✅ Implemented |
| **Postgres** | Self-hosted, production-ready | 🚧 Issue #50 |
| **SQLite** | Development, small deployments | 🚧 Issue #51 |

#### B. Realtime / Events

| Option | Requirements | Status |
|--------|--------------|--------|
| **Convex** | DB=Convex | ✅ Implemented |
| **ws-nats** | NATS + WebSocket gateway | 🚧 Issue #52 |
| **ws-redis** | Redis + WebSocket gateway | 🚧 Issue #53 |
| **none** | Polling fallback | 🚧 Issue #56 |

#### C. Search / Index

| Option | Requirements | Status |
|--------|--------------|--------|
| **convex_search** | DB=Convex | ✅ Implemented |
| **pg_fts** | DB=Postgres | 🚧 Issue #54 |
| **meilisearch** | Meilisearch server | 🚧 Issue #55 |
| **typesense** | Typesense server | 🚧 Issue #55 |
| **none** | No search | ✅ Supported |

### Configuration System

**Environment Variables:**

```bash
# Database Selection
KIIAREN_DB_TYPE=convex|postgres|sqlite

# Database Connection (if not Convex)
KIIAREN_DATABASE_URL=postgresql://...  # Postgres
KIIAREN_DATABASE_PATH=./data.db        # SQLite

# Convex (if DB=convex)
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOYMENT=prod:...

# Realtime Selection
KIIAREN_REALTIME_TYPE=convex|ws-nats|ws-redis|none

# Realtime Connection (if not Convex)
KIIAREN_NATS_URL=nats://...            # For ws-nats
KIIAREN_REDIS_URL=redis://...          # For ws-redis
NEXT_PUBLIC_KIIAREN_WS_URL=ws://...    # WebSocket gateway

# Search Selection
KIIAREN_SEARCH_TYPE=pg_fts|meilisearch|typesense|convex_search|none

# Search Connection (if not pg_fts/convex_search)
KIIAREN_MEILISEARCH_URL=http://...
KIIAREN_TYPESENSE_URL=http://...
```

### Code Characteristics

- Provider selection based on configuration
- Provider composition system
- Compatibility validation
- Multiple backend paths
- Extensible architecture

## Common Configurations

### 1. Convex Full-Stack (Default)
```bash
KIIAREN_DB_TYPE=convex
KIIAREN_REALTIME_TYPE=convex
KIIAREN_SEARCH_TYPE=convex_search
```
**Best for:** Quick start, managed infrastructure

### 2. Postgres + Redis + Meilisearch
```bash
KIIAREN_DB_TYPE=postgres
KIIAREN_DATABASE_URL=postgresql://...
KIIAREN_REALTIME_TYPE=ws-redis
KIIAREN_REDIS_URL=redis://...
NEXT_PUBLIC_KIIAREN_WS_URL=ws://gateway:8080
KIIAREN_SEARCH_TYPE=meilisearch
KIIAREN_MEILISEARCH_URL=http://meilisearch:7700
```
**Best for:** Self-hosted production deployments

### 3. SQLite + None + None
```bash
KIIAREN_DB_TYPE=sqlite
KIIAREN_DATABASE_PATH=./data.db
KIIAREN_REALTIME_TYPE=none
KIIAREN_SEARCH_TYPE=none
```
**Best for:** Development, simple deployments

### 4. Postgres + NATS + pg_fts
```bash
KIIAREN_DB_TYPE=postgres
KIIAREN_DATABASE_URL=postgresql://...
KIIAREN_REALTIME_TYPE=ws-nats
KIIAREN_NATS_URL=nats://...
NEXT_PUBLIC_KIIAREN_WS_URL=ws://gateway:8080
KIIAREN_SEARCH_TYPE=pg_fts
```
**Best for:** Enterprise self-hosted deployments

## Compatibility Matrix

| DB | Realtime | Search | Valid? | Notes |
|----|----------|--------|--------|-------|
| Convex | Convex | convex_search | ✅ | Native Convex |
| Convex | Convex | none | ✅ | Convex without search |
| Postgres | ws-redis | pg_fts | ✅ | Common self-host |
| Postgres | ws-nats | meilisearch | ✅ | Enterprise setup |
| SQLite | none | none | ✅ | Simple setup |
| Convex | ws-redis | convex_search | ❌ | Convex search requires Convex DB |
| Postgres | Convex | pg_fts | ❌ | Convex realtime requires Convex DB |

## Implementation Status

See GitHub issues for detailed implementation status:
- **KIIAREN-Release:** Issue #48 (parent), #49-#59 (sub-issues)
- **KIIAREN-SAAS:** Issue #35 (hardcode Convex)

## Migration Between Repos

### From Release to SAAS

1. Remove provider selection code
2. Hardcode Convex provider
3. Remove alternative backend code
4. Update environment variables

### From SAAS to Release

1. Add provider selection logic
2. Implement alternative providers
3. Add configuration system
4. Update environment variables

## Development Workflow

### Working on Shared Code

1. Make changes in KIIAREN-Release
2. Test with Convex (default)
3. Merge to Release repo
4. Cherry-pick to SAAS repo (if applicable)

### Working on SAAS-Specific Code

1. Work directly in KIIAREN-SAAS
2. Do not merge to Release
3. Keep SAAS-specific changes isolated

### Working on Release-Specific Code

1. Work in KIIAREN-Release
2. Add provider options
3. Do not merge to SAAS
4. Keep Release-specific flexibility