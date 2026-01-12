# Migration Notes for Maintainers

This document describes the provider abstraction layer implementation and migration status.

## Implementation Status

### Completed

| Component | Location | Status |
|-----------|----------|--------|
| Provider interfaces | `packages/core/src/providers/types.ts` | Done |
| Managed feature definitions | `packages/core/src/managed/types.ts` | Done |
| React context & hooks | `apps/web/lib/provider/context.tsx` | Done |
| Provider selection | `apps/web/components/backend-provider.tsx` | Done |
| Convex adapter | `apps/web/lib/provider/convex-adapter.tsx` | Done |
| Self-host adapter (skeleton) | `apps/web/lib/provider/self-host-adapter.tsx` | Skeleton |
| Feature gate components | `apps/web/components/feature-gate.tsx` | Done |
| Layout integration | `apps/web/app/layout.tsx` | Done |

### Not Changed

- `apps/web/features/*/api/*.ts` - Feature hooks still use Convex directly
- `convex/` - No changes to backend functions
- All existing functionality preserved

## How It Works

### Provider Selection

```
NEXT_PUBLIC_KIIAREN_PROVIDER="convex"  ← default
                                   or "self-host" (not implemented)
```

Set in `.env` file. The `BackendProvider` component in `layout.tsx` reads this and instantiates the appropriate provider.

### Provider Architecture

```
apps/web/app/layout.tsx
    └─ BackendProvider (components/backend-provider.tsx)
        └─ [ConvexBackendProvider | SelfHostBackendProvider]
            └─ BackendProviderContext (lib/provider/context.tsx)
                └─ Your components (can use useBackend(), etc.)
```

### Available Hooks

```typescript
import { useBackend, useManagedFeature, useIsManaged } from '@/lib/provider';

// Get full provider access
const { provider, isReady, error } = useBackend();

// Check if a managed feature is available
const hasSearch = useManagedFeature('indexed_search');

// Check if provider is managed
const isManaged = useIsManaged();
```

### Feature Gating Components

```tsx
import { FeatureGate, ManagedOnly, ManagedFeatureNotice } from '@/components/feature-gate';

// Gate specific features
<FeatureGate feature="indexed_search" fallback={<BasicSearch />}>
  <IndexedSearch />
</FeatureGate>

// Gate to managed providers only
<ManagedOnly fallback={<SelfHostNotice />}>
  <EnterprisePanel />
</ManagedOnly>
```

## Existing Code Compatibility

Existing feature hooks (`useGetWorkspaces`, `useCreateMessage`, etc.) continue to work unchanged:

```typescript
// This still works - no changes required
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

export const useGetWorkspaces = () => {
  const data = useQuery(api.workspaces.get);
  return { data, isLoading: data === undefined };
};
```

The provider abstraction is **additive**. You can use:
1. Direct Convex hooks (existing pattern)
2. Provider hooks for feature gating
3. Both patterns simultaneously

## Provider Interface vs Convex Hooks

The `BackendProvider` interface uses async functions (promise-based), while Convex uses React hooks (reactive). For the Convex provider:

| Provider Method | Convex Hook |
|-----------------|-------------|
| `provider.persistence.workspace.get()` | `useQuery(api.workspaces.get)` |
| `provider.persistence.message.create()` | `useMutation(api.messages.create)` |

The provider interface methods throw `NOT_IN_REACT` errors because they must be called within hooks. This is intentional - the provider interface is for:
1. Feature gating (`provider.isManaged`)
2. Provider identification (`provider.id`)
3. Future abstraction (when migrating away from direct Convex calls)

For now, continue using Convex hooks directly for data operations.

## Migration Path for Components

If you want to make a component provider-agnostic:

### Phase 1: Add Feature Gating (Current)

```tsx
import { useManagedFeature } from '@/lib/provider';

function SearchPanel() {
  const hasIndexedSearch = useManagedFeature('indexed_search');

  if (hasIndexedSearch) {
    return <IndexedSearchPanel />;
  }
  return <BasicSearchPanel />;
}
```

### Phase 2: Abstract Data Hooks (Future)

When self-host is implemented, abstract the data hooks:

```tsx
// apps/web/lib/provider/hooks/use-workspaces.ts
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useProviderId } from '@/lib/provider';

export function useWorkspaces() {
  const providerId = useProviderId();

  if (providerId === 'convex') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(api.workspaces.get);
  }

  // Self-host implementation would go here
  throw new Error('Self-host not implemented');
}
```

## Environment Variables

```bash
# Provider selection (default: convex)
NEXT_PUBLIC_KIIAREN_PROVIDER=convex

# Convex (required for convex provider)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Self-host (required for self-host provider, not implemented)
KIIAREN_DATABASE_URL=postgresql://...
NEXT_PUBLIC_KIIAREN_WS_URL=wss://...
```

## Testing

1. **Default Convex behavior**: Run app normally, everything should work
2. **Feature gating**: Check that `useManagedFeature()` returns `true` for Convex
3. **Self-host error**: Set `NEXT_PUBLIC_KIIAREN_PROVIDER=self-host`, expect warning + errors

## File Reference

| File | Purpose |
|------|---------|
| `apps/web/lib/provider/index.ts` | Main export for provider runtime |
| `apps/web/lib/provider/context.tsx` | React context and hooks |
| `apps/web/lib/provider/types.ts` | Provider runtime types |
| `apps/web/lib/provider/convex-adapter.tsx` | Convex provider implementation |
| `apps/web/lib/provider/self-host-adapter.tsx` | Self-host provider skeleton |
| `apps/web/components/backend-provider.tsx` | Provider selection component |
| `apps/web/components/feature-gate.tsx` | Feature gating components |
| `packages/core/src/providers/types.ts` | Interface definitions |
| `packages/core/src/managed/types.ts` | Managed feature definitions |

## Known Limitations

1. **Self-host not implemented**: Selecting `self-host` provider will show warnings and errors
2. **Provider interface throws in Convex**: Direct data operations via `provider.persistence.*` throw because Convex requires hooks
3. **No runtime provider switching**: Provider is selected at build time via env var

## Future Work

1. Implement self-host provider (PostgreSQL + WebSocket)
2. Create provider-agnostic data hooks
3. Add provider health checks
4. Runtime provider switching for multi-tenant

---

*Last updated: Provider abstraction wired into apps/web*
