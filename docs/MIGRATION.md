# Migration Notes for Maintainers

This document describes the provider abstraction layer and how to integrate it with the existing codebase.

## Overview

The `@kiiaren/core` package introduces a provider abstraction layer that:

1. Defines interfaces for all backend operations
2. Separates managed-only features from OSS
3. Enables future self-hosted deployments
4. Does not break current Convex-based functionality

## Current State

**Created:**
- `packages/core/` - Provider abstraction layer
- `packages/core/src/providers/types.ts` - Interface definitions
- `packages/core/src/providers/convex/` - Convex provider (skeleton)
- `packages/core/src/providers/self-host/` - Self-host provider (skeleton)
- `packages/core/src/managed/types.ts` - Managed-only feature definitions

**Not changed:**
- `apps/web/` - Still uses Convex directly
- `convex/` - No changes to backend functions
- Existing functionality is preserved

## Migration Strategy

Migration is **incremental and optional**. The existing Convex integration continues to work. New code can optionally use the provider interface.

### Phase 1: Coexistence (Current)

```
apps/web uses:
├── Direct Convex imports (existing code)    ← works
└── @kiiaren/core interfaces (new code)      ← works
```

Both patterns work simultaneously. No breaking changes.

### Phase 2: Provider Context (Next)

Add provider context to apps/web:

```tsx
// apps/web/components/kiiaren-provider.tsx

import { createContext, useContext, ReactNode } from 'react';
import { BackendProvider, createConvexProvider } from '@kiiaren/core';

const KIIARENContext = createContext<BackendProvider | null>(null);

export function KIIARENProvider({
  children,
  provider,
}: {
  children: ReactNode;
  provider: BackendProvider;
}) {
  return (
    <KIIARENContext.Provider value={provider}>
      {children}
    </KIIARENContext.Provider>
  );
}

export function useBackendProvider() {
  const provider = useContext(KIIARENContext);
  if (!provider) {
    throw new Error('useBackendProvider must be used within KIIARENProvider');
  }
  return provider;
}
```

Add to layout:

```tsx
// apps/web/app/layout.tsx

import { createConvexProvider } from '@kiiaren/core';
import { KIIARENProvider } from '@/components/kiiaren-provider';

const provider = createConvexProvider();

export default function RootLayout({ children }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <KIIARENProvider provider={provider}>
        {/* existing providers */}
        {children}
      </KIIARENProvider>
    </ConvexAuthNextjsServerProvider>
  );
}
```

### Phase 3: Gradual Hook Migration

Migrate feature hooks to use provider interface. This is optional - existing hooks continue to work.

**Before (direct Convex):**

```tsx
// apps/web/features/messages/api/use-create-message.ts

import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export const useCreateMessage = () => {
  const mutation = useMutation(api.messages.create);
  // ...
};
```

**After (via provider):**

```tsx
// apps/web/features/messages/api/use-create-message.ts

import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useBackendProvider } from '@/components/kiiaren-provider';

export const useCreateMessage = () => {
  const { persistence } = useBackendProvider();

  // For now, still use Convex directly
  // Provider interface is for future abstraction
  const mutation = useMutation(api.messages.create);

  // In future, can switch to:
  // const create = persistence.message.create;

  // ...
};
```

### Phase 4: ConvexProvider Implementation

Implement the ConvexProvider to actually wrap Convex hooks:

```tsx
// packages/core/src/providers/convex/react.tsx

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { PersistenceProvider, Message, PaginatedResult } from '../types';

export function useConvexPersistence(): PersistenceProvider {
  return {
    message: {
      async create(data) {
        // This would need to be called differently in React context
        // Likely via a mutation hook wrapper
      },
      // ...
    },
    // ...
  };
}
```

Note: Full implementation requires reconciling Convex's hook-based API with the promise-based provider interface. This may require wrapper components or a different approach.

### Phase 5: Self-Host Implementation (Future)

When self-host provider is implemented:

1. Implement all methods in `packages/core/src/providers/self-host/`
2. Add database connection logic
3. Add WebSocket event handling
4. Test with PostgreSQL backend

## File Locations

### Provider Interfaces

| File | Purpose |
|------|---------|
| `packages/core/src/providers/types.ts` | All interface definitions |
| `packages/core/src/index.ts` | Public exports |

### Provider Implementations

| File | Purpose |
|------|---------|
| `packages/core/src/providers/convex/index.ts` | Convex provider (skeleton) |
| `packages/core/src/providers/self-host/index.ts` | Self-host provider (skeleton) |

### Managed Features

| File | Purpose |
|------|---------|
| `packages/core/src/managed/types.ts` | Extension hooks, feature gates |

## Interface Summary

### BackendProvider

```typescript
interface BackendProvider {
  id: string;
  name: string;
  isManaged: boolean;

  auth: AuthProvider;
  events: EventsProvider;
  persistence: PersistenceProvider;
  storage: StorageProvider;

  initialize(config): Promise<void>;
  destroy(): Promise<void>;
}
```

### PersistenceProvider

```typescript
interface PersistenceProvider {
  workspace: {
    create(name: string): Promise<EntityId>;
    get(id: EntityId): Promise<Workspace | null>;
    // ...
  };
  channel: { /* CRUD */ };
  member: { /* CRUD */ };
  message: { /* CRUD + pagination */ };
  reaction: { toggle(messageId, value) };
  conversation: { createOrGet(...) };
  doc: { /* CRUD + archive/restore + search */ };
  board: { /* CRUD */ };
}
```

### ExtensionHooks (Managed-Only)

```typescript
interface ExtensionHooks {
  audit: {
    log(event): Promise<void>;  // no-op in OSS
    query(params): Promise<never>;  // throws in OSS
  };
  search: {
    index(event): Promise<void>;  // no-op in OSS
    search(params): Promise<never>;  // throws in OSS
  };
  ai: { /* ... */ };
  notification: { /* ... */ };
  kms: { /* ... */ };
}
```

## Testing

After migration:

1. Run existing test suite - no regressions
2. Test provider initialization
3. Test feature flag behavior (isManaged)
4. Test extension hook error messages in OSS

## Breaking Changes

None. This is an additive change. Existing code continues to work.

## Future Work

1. **React integration** - Reconcile hook-based Convex API with provider interface
2. **Self-host implementation** - PostgreSQL + WebSocket backend
3. **Provider switching** - Runtime provider selection based on config
4. **Extension hook routing** - Connect to managed services when available

## Questions

For implementation questions, refer to:
- `docs/ARCHITECTURE.md` - System design
- `docs/EDITIONING.md` - OSS vs managed boundaries
- `packages/core/src/providers/types.ts` - Interface definitions

---

*This document will be updated as migration progresses.*
