# KIIAREN Architecture

This document describes the system architecture with emphasis on the provider abstraction layer that enables both managed and self-hosted deployments.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         apps/web (Next.js)                          │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │    Pages     │  │  Components  │  │   Features   │              │   │
│  │  │  (App Dir)   │  │    (UI)      │  │  (API Hooks) │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                              │                                       │   │
│  │                              ▼                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │              Provider Context (React Context)                 │   │   │
│  │  │              useBackendProvider() hook                        │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ABSTRACTION LAYER                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     @kiiaren/core (Interface)                       │   │
│  │                                                                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │   │
│  │  │    Auth    │ │   Events   │ │Persistence │ │  Storage   │       │   │
│  │  │  Provider  │ │  Provider  │ │  Provider  │ │  Provider  │       │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Extension Hooks                            │   │   │
│  │  │   audit │ search │ ai │ notification │ kms                   │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│       MANAGED PROVIDER            │ │      SELF-HOST PROVIDER           │
│                                   │ │                                   │
│  ┌─────────────────────────────┐  │ │  ┌─────────────────────────────┐  │
│  │      ConvexProvider         │  │ │  │     SelfHostProvider        │  │
│  │      isManaged = true       │  │ │  │     isManaged = false       │  │
│  └─────────────────────────────┘  │ │  └─────────────────────────────┘  │
│               │                   │ │               │                   │
│               ▼                   │ │               ▼                   │
│  ┌─────────────────────────────┐  │ │  ┌─────────────────────────────┐  │
│  │        Convex Cloud         │  │ │  │      PostgreSQL 14+         │  │
│  │   - Real-time subscriptions │  │ │  │      WebSocket Server       │  │
│  │   - Auth (@convex-dev/auth) │  │ │  │      S3 / Local Storage     │  │
│  │   - Storage (_storage)      │  │ │  │      JWT Auth               │  │
│  │   - Automatic scaling       │  │ │  │      Manual scaling         │  │
│  └─────────────────────────────┘  │ │  └─────────────────────────────┘  │
│                                   │ │                                   │
│  ┌─────────────────────────────┐  │ │  ┌─────────────────────────────┐  │
│  │   Managed-Only Services     │  │ │  │     Extension Hooks         │  │
│  │   - KMS                     │  │ │  │     (stubs/no-ops)          │  │
│  │   - Indexed Search          │  │ │  │                             │  │
│  │   - Audit Logging           │  │ │  │   audit.log() → no-op      │  │
│  │   - AI Infrastructure       │  │ │  │   search.search() → throw  │  │
│  │   - Push Notifications      │  │ │  │   kms.encrypt() → throw    │  │
│  └─────────────────────────────┘  │ │  └─────────────────────────────┘  │
│                                   │ │                                   │
└───────────────────────────────────┘ └───────────────────────────────────┘
```

## Package Structure

```
KIIAREN/
├── apps/
│   └── web/                          # Next.js application
│       ├── app/                      # App router pages
│       ├── components/               # UI components
│       ├── features/                 # Feature modules (api/, components/, store/)
│       └── hooks/                    # Shared React hooks
│
├── packages/
│   ├── core/                         # Provider abstraction layer
│   │   └── src/
│   │       ├── providers/
│   │       │   ├── types.ts          # Interface definitions
│   │       │   ├── convex/           # ConvexProvider implementation
│   │       │   └── self-host/        # SelfHostProvider skeleton
│   │       ├── managed/
│   │       │   └── types.ts          # Managed features & extension hooks
│   │       └── index.ts              # Public exports
│   │
│   └── shared/                       # Shared types and utilities
│       └── src/
│           ├── types/                # Re-exported Convex types
│           ├── schemas/              # Zod validation schemas
│           └── config/               # Environment configuration
│
├── convex/                           # Convex backend (managed provider)
│   ├── schema.ts                     # Database schema
│   ├── auth.ts                       # Authentication setup
│   ├── lib/access_control.ts         # Authorization helpers
│   └── [entity].ts                   # Query/mutation functions
│
└── docs/                             # Documentation
    ├── ARCHITECTURE.md               # This file
    └── EDITIONING.md                 # OSS vs Managed boundaries
```

## Data Flow

### Event-Centric Design

All state changes flow through the event kernel:

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User      │     │   Event         │     │   Provider      │
│   Action    │ ──▶ │   Kernel        │ ──▶ │   Mutation      │
│             │     │                 │     │                 │
└─────────────┘     └─────────────────┘     └─────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │           Extension Hooks              │
        │                                        │
        │  ┌─────────┐  ┌─────────┐  ┌───────┐  │
        │  │ Audit   │  │ Search  │  │  AI   │  │
        │  └─────────┘  └─────────┘  └───────┘  │
        │                                        │
        │  (no-op in OSS, functional in managed) │
        └───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Real-time Subscriptions                  │
│                                                             │
│   Convex: Automatic via useQuery() reactive subscriptions   │
│   Self-host: WebSocket push on mutation completion          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │   Client    │
                    │   Update    │
                    └─────────────┘
```

### Request Processing

```
HTTP Request → Auth Check → Permission Check → Business Logic → Mutation → Event → Response
     │              │              │                  │            │          │
     │              │              │                  │            │          └─ Return to client
     │              │              │                  │            │
     │              │              │                  │            └─ Trigger real-time updates
     │              │              │                  │               Emit to extension hooks
     │              │              │                  │
     │              │              │                  └─ Domain logic
     │              │              │                     Validation
     │              │              │
     │              │              └─ RBAC check (member role, ownership)
     │              │
     │              └─ Session validation (JWT / Convex auth)
     │
     └─ TLS termination
```

## Provider Interface

The `BackendProvider` interface is the central abstraction:

```typescript
interface BackendProvider {
  // Identity
  readonly id: 'convex' | 'self-host' | string;
  readonly name: string;
  readonly isManaged: boolean;

  // Sub-providers
  auth: AuthProvider;         // Authentication & session
  events: EventsProvider;     // Real-time subscriptions
  persistence: PersistenceProvider;  // CRUD operations
  storage: StorageProvider;   // File/blob storage

  // Lifecycle
  initialize(config: ProviderConfig): Promise<void>;
  destroy(): Promise<void>;
}
```

### AuthProvider

Handles user identity and session management:

```typescript
interface AuthProvider {
  getSession(): Promise<Session | null>;
  getCurrentUser(): Promise<UserIdentity | null>;
  signInWithPassword(email: string, password: string): Promise<void>;
  signUpWithPassword(email: string, password: string, name: string): Promise<void>;
  signInWithOAuth(provider: 'google' | 'github'): Promise<void>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (session: Session | null) => void): UnsubscribeFn;
}
```

### EventsProvider

Handles real-time event subscriptions:

```typescript
interface EventsProvider {
  subscribe(
    workspaceId: EntityId,
    eventTypes: KernelEvent['type'][],
    callback: (event: KernelEvent) => void
  ): UnsubscribeFn;

  emit(event: KernelEvent): Promise<void>;
}
```

### PersistenceProvider

CRUD operations for all domain entities:

```typescript
interface PersistenceProvider {
  workspace: { create, get, update, remove, getByUserId, join, regenerateJoinCode };
  channel: { create, get, getById, update, remove };
  member: { get, getById, getCurrent, updateRole, remove };
  message: { create, get, getById, update, remove };
  reaction: { toggle };
  conversation: { createOrGet };
  doc: { create, get, getById, update, archive, restore, remove, search };
  board: { create, get, getById, update, remove };
}
```

### StorageProvider

File upload and retrieval:

```typescript
interface StorageProvider {
  generateUploadUrl(): Promise<string>;
  getUrl(storageId: EntityId): Promise<string | null>;
  remove(storageId: EntityId): Promise<void>;
}
```

## Domain Events

The kernel emits typed events for all state changes:

| Event Type | Payload | Description |
|------------|---------|-------------|
| `message.created` | messageId, channelId, body, hasAttachment | New message posted |
| `message.updated` | messageId, body | Message edited |
| `message.deleted` | messageId | Message removed |
| `reaction.toggled` | messageId, reaction, added | Reaction added/removed |
| `channel.created` | channelId, name | New channel created |
| `channel.updated` | channelId, name | Channel renamed |
| `member.joined` | memberId, userId, role | User joined workspace |
| `member.left` | memberId, userId | User left workspace |
| `presence.changed` | userId, status | User presence update |

Events enable:
1. Real-time UI updates
2. Extension hook triggers
3. Audit trail (managed tier)
4. Search indexing (managed tier)

## Security Model

### Authentication

```
┌──────────────────────────────────────────────────────────────┐
│                    Authentication Flow                        │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                  │
│  │  Email/Password │    │     OAuth       │                  │
│  │                 │    │  Google/GitHub  │                  │
│  └────────┬────────┘    └────────┬────────┘                  │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│                      ▼                                       │
│           ┌─────────────────────┐                            │
│           │   Session Created   │                            │
│           │   JWT Issued        │                            │
│           └─────────────────────┘                            │
│                      │                                       │
│                      ▼                                       │
│           ┌─────────────────────┐                            │
│           │ Session Validated   │                            │
│           │ on Each Request     │                            │
│           └─────────────────────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Authorization (RBAC)

```typescript
// Access control helpers (convex/lib/access_control.ts)

requireAuth(ctx)
  // Returns userId or throws "Unauthorized"

requireWorkspaceMember(ctx, workspaceId)
  // Returns member record or throws "Not a member"

requireWorkspaceAdmin(ctx, workspaceId)
  // Returns member record or throws "Not an admin"
```

Permission matrix:

| Operation | Anonymous | Member | Admin | Owner |
|-----------|-----------|--------|-------|-------|
| View workspace | - | Yes | Yes | Yes |
| Send message | - | Yes | Yes | Yes |
| Edit own message | - | Yes | Yes | Yes |
| Delete any message | - | - | Yes | Yes |
| Create channel | - | - | Yes | Yes |
| Remove member | - | - | Yes | Yes |
| Delete workspace | - | - | - | Yes |

## Managed vs Self-Host Comparison

| Aspect | Managed (Convex) | Self-Host (Postgres) |
|--------|------------------|----------------------|
| Real-time | Automatic query subscriptions | WebSocket push |
| Auth | @convex-dev/auth | JWT + bcrypt/argon2 |
| Storage | _storage (built-in) | S3/MinIO/Local |
| Scaling | Automatic | Manual |
| Backups | Managed | Your responsibility |
| Search | Indexed (managed service) | ILIKE queries only |
| KMS | Available | Not available |
| Audit | Available | Not available |

## Extension Points

### For Managed Features

Extension hooks allow OSS code to emit events that managed tier processes:

```typescript
// OSS code emits (no-op in self-host)
await hooks.audit.log({
  action: 'message.create',
  actorId: userId,
  resourceType: 'message',
  resourceId: messageId,
  workspaceId,
  timestamp: Date.now(),
});

// Managed tier processes
// Self-host: no-op (event discarded)
```

### For Custom Providers

New providers can be added by implementing `BackendProvider`:

```typescript
import { BackendProvider } from '@kiiaren/core';

export function createCustomProvider(): BackendProvider {
  return {
    id: 'custom',
    name: 'Custom Provider',
    isManaged: false,

    auth: { /* implement AuthProvider */ },
    events: { /* implement EventsProvider */ },
    persistence: { /* implement PersistenceProvider */ },
    storage: { /* implement StorageProvider */ },

    async initialize(config) { /* setup */ },
    async destroy() { /* cleanup */ },
  };
}
```

## Future Considerations

### MRFY Integration

The architecture is designed to support future MRFY integration:

- Event-centric design allows MRFY to subscribe to kernel events
- Extension hooks provide integration points
- Provider abstraction allows MRFY-specific backend if needed

Integration will be additive - no breaking changes to existing architecture.

### Multi-Tenancy

Managed tier supports multi-tenancy:

- Workspace isolation at database level
- Tenant-aware event routing
- Per-tenant feature flags
- Shared infrastructure, isolated data
