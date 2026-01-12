'use client';

/**
 * Self-Host Backend Provider Adapter (SKELETON)
 *
 * This adapter is a placeholder for self-hosted deployments using
 * PostgreSQL + WebSocket. It is NOT implemented.
 *
 * STATUS: Compiles but throws on all operations.
 *
 * To implement self-hosting:
 * 1. Implement PostgreSQL persistence layer
 * 2. Implement WebSocket real-time layer
 * 3. Implement local/S3 storage layer
 * 4. Replace the NOT_IMPLEMENTED errors with real implementations
 */

import { type ReactNode, useMemo } from 'react';
import type {
  BackendProvider,
  AuthProvider,
  EventsProvider,
  PersistenceProvider,
  StorageProvider,
  EntityId,
  Session,
  UserIdentity,
  KernelEvent,
  UnsubscribeFn,
  Workspace,
  Channel,
  Member,
  Message,
  Doc,
  Board,
  PaginatedResult,
} from '@kiiaren/core';
import { BackendProviderContext } from './context';

// -----------------------------------------------------------------------------
// Error Helper
// -----------------------------------------------------------------------------

const NOT_IMPLEMENTED = (method: string): never => {
  throw new Error(
    `[SelfHostProvider] ${method} is not implemented. ` +
    `Self-host provider is a skeleton. See docs/EDITIONING.md for status.`
  );
};

// -----------------------------------------------------------------------------
// Self-Host Provider Implementation
// -----------------------------------------------------------------------------

function createSelfHostBackendProvider(): BackendProvider {
  const auth: AuthProvider = {
    async getSession(): Promise<Session | null> { NOT_IMPLEMENTED('auth.getSession'); },
    async getCurrentUser(): Promise<UserIdentity | null> { NOT_IMPLEMENTED('auth.getCurrentUser'); },
    async signInWithPassword(): Promise<void> { NOT_IMPLEMENTED('auth.signInWithPassword'); },
    async signUpWithPassword(): Promise<void> { NOT_IMPLEMENTED('auth.signUpWithPassword'); },
    async signInWithOAuth(): Promise<void> { NOT_IMPLEMENTED('auth.signInWithOAuth'); },
    async signOut(): Promise<void> { NOT_IMPLEMENTED('auth.signOut'); },
    onAuthStateChange(): UnsubscribeFn { NOT_IMPLEMENTED('auth.onAuthStateChange'); },
  };

  const events: EventsProvider = {
    subscribe(): UnsubscribeFn { NOT_IMPLEMENTED('events.subscribe'); },
    async emit(): Promise<void> { NOT_IMPLEMENTED('events.emit'); },
  };

  const persistence: PersistenceProvider = {
    workspace: {
      async create(): Promise<EntityId> { NOT_IMPLEMENTED('workspace.create'); },
      async get(): Promise<Workspace | null> { NOT_IMPLEMENTED('workspace.get'); },
      async update(): Promise<void> { NOT_IMPLEMENTED('workspace.update'); },
      async remove(): Promise<void> { NOT_IMPLEMENTED('workspace.remove'); },
      async getByUserId(): Promise<Workspace[]> { NOT_IMPLEMENTED('workspace.getByUserId'); },
      async join(): Promise<EntityId> { NOT_IMPLEMENTED('workspace.join'); },
      async regenerateJoinCode(): Promise<string> { NOT_IMPLEMENTED('workspace.regenerateJoinCode'); },
    },
    channel: {
      async create(): Promise<EntityId> { NOT_IMPLEMENTED('channel.create'); },
      async get(): Promise<Channel[]> { NOT_IMPLEMENTED('channel.get'); },
      async getById(): Promise<Channel | null> { NOT_IMPLEMENTED('channel.getById'); },
      async update(): Promise<void> { NOT_IMPLEMENTED('channel.update'); },
      async remove(): Promise<void> { NOT_IMPLEMENTED('channel.remove'); },
    },
    member: {
      async get(): Promise<Member[]> { NOT_IMPLEMENTED('member.get'); },
      async getById(): Promise<Member | null> { NOT_IMPLEMENTED('member.getById'); },
      async getCurrent(): Promise<Member | null> { NOT_IMPLEMENTED('member.getCurrent'); },
      async updateRole(): Promise<void> { NOT_IMPLEMENTED('member.updateRole'); },
      async remove(): Promise<void> { NOT_IMPLEMENTED('member.remove'); },
    },
    message: {
      async create(): Promise<EntityId> { NOT_IMPLEMENTED('message.create'); },
      async get(): Promise<PaginatedResult<Message>> { NOT_IMPLEMENTED('message.get'); },
      async getById(): Promise<Message | null> { NOT_IMPLEMENTED('message.getById'); },
      async update(): Promise<void> { NOT_IMPLEMENTED('message.update'); },
      async remove(): Promise<void> { NOT_IMPLEMENTED('message.remove'); },
    },
    reaction: {
      async toggle(): Promise<void> { NOT_IMPLEMENTED('reaction.toggle'); },
    },
    conversation: {
      async createOrGet(): Promise<EntityId> { NOT_IMPLEMENTED('conversation.createOrGet'); },
    },
    doc: {
      async create(): Promise<EntityId> { NOT_IMPLEMENTED('doc.create'); },
      async get(): Promise<Doc[]> { NOT_IMPLEMENTED('doc.get'); },
      async getById(): Promise<Doc | null> { NOT_IMPLEMENTED('doc.getById'); },
      async update(): Promise<void> { NOT_IMPLEMENTED('doc.update'); },
      async archive(): Promise<void> { NOT_IMPLEMENTED('doc.archive'); },
      async restore(): Promise<void> { NOT_IMPLEMENTED('doc.restore'); },
      async remove(): Promise<void> { NOT_IMPLEMENTED('doc.remove'); },
      async search(): Promise<Doc[]> { NOT_IMPLEMENTED('doc.search'); },
    },
    board: {
      async create(): Promise<EntityId> { NOT_IMPLEMENTED('board.create'); },
      async get(): Promise<Board[]> { NOT_IMPLEMENTED('board.get'); },
      async getById(): Promise<Board | null> { NOT_IMPLEMENTED('board.getById'); },
      async update(): Promise<void> { NOT_IMPLEMENTED('board.update'); },
      async remove(): Promise<void> { NOT_IMPLEMENTED('board.remove'); },
    },
  };

  const storage: StorageProvider = {
    async generateUploadUrl(): Promise<string> { NOT_IMPLEMENTED('storage.generateUploadUrl'); },
    async getUrl(): Promise<string | null> { NOT_IMPLEMENTED('storage.getUrl'); },
    async remove(): Promise<void> { NOT_IMPLEMENTED('storage.remove'); },
  };

  return {
    id: 'self-host',
    name: 'Self-Hosted (Community)',
    isManaged: false, // Self-host is NOT managed

    auth,
    events,
    persistence,
    storage,

    async initialize(): Promise<void> {
      console.warn(
        '[SelfHostProvider] Self-host provider is not implemented. ' +
        'The application will not function. Use Convex provider instead.'
      );
    },
    async destroy(): Promise<void> {
      // No cleanup needed for skeleton
    },
  };
}

// -----------------------------------------------------------------------------
// Self-Host Backend Provider Component
// -----------------------------------------------------------------------------

interface SelfHostBackendProviderProps {
  children: ReactNode;
}

/**
 * Self-host backend provider component.
 *
 * WARNING: This is a skeleton implementation.
 * Using this provider will result in runtime errors for all operations.
 */
export function SelfHostBackendProvider({ children }: SelfHostBackendProviderProps) {
  const provider = useMemo(() => createSelfHostBackendProvider(), []);

  // Show warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[KIIAREN] Self-host provider selected but not implemented. ' +
      'Set NEXT_PUBLIC_KIIAREN_PROVIDER=convex to use Convex.'
    );
  }

  return (
    <BackendProviderContext
      provider={provider}
      isReady={false}
      error={new Error('Self-host provider is not implemented')}
    >
      {children}
    </BackendProviderContext>
  );
}
