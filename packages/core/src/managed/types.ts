/**
 * Managed-Only Features Definition
 *
 * This module defines features that are architecturally restricted to the
 * managed tier. These cannot be enabled via configuration in OSS - they
 * require infrastructure and services only available in managed deployments.
 *
 * DESIGN PRINCIPLE:
 * Features are managed-only when they require:
 * 1. Infrastructure not self-hostable (proprietary services, scale)
 * 2. Security guarantees requiring operational trust
 * 3. Compliance requirements needing formal verification
 * 4. Data processing that creates liability
 */

import type { EntityId, KernelEvent } from '../providers/types';

// -----------------------------------------------------------------------------
// Feature Gate Types
// -----------------------------------------------------------------------------

/**
 * Managed-only feature identifiers.
 * OSS code can reference these, but implementations are no-ops or throw.
 */
export type ManagedFeature =
  | 'kms' // Key Management Service
  | 'encrypted_sync' // Cross-device E2E encrypted sync
  | 'indexed_search' // Long-term indexed full-text search
  | 'audit_logs' // Compliance audit logging
  | 'ediscovery' // Legal discovery exports
  | 'sso_saml' // Enterprise SSO (SAML/OIDC)
  | 'ai_agents' // AI agents with persistent memory
  | 'push_notifications' // Native push notification infrastructure
  | 'sla_monitoring' // SLA tracking and incident management
  | 'backup_restore' // Automated backup and point-in-time restore
  | 'analytics' // Usage analytics and reporting
  | 'admin_console'; // Multi-tenant admin console

/**
 * Feature availability check result
 */
export interface FeatureAvailability {
  available: boolean;
  reason?: string;
  requiresManaged: boolean;
  documentationUrl?: string;
}

/**
 * Feature gate - architectural enforcement of managed boundaries
 */
export interface FeatureGate {
  /**
   * Check if a feature is available in current deployment
   */
  isAvailable(feature: ManagedFeature): FeatureAvailability;

  /**
   * Assert feature availability, throw if not available
   */
  requireFeature(feature: ManagedFeature): void;

  /**
   * List all available features
   */
  listAvailable(): ManagedFeature[];

  /**
   * List all managed-only features (not available in OSS)
   */
  listManagedOnly(): ManagedFeature[];
}

// -----------------------------------------------------------------------------
// Extension Hook Types (OSS can emit, Managed can handle)
// -----------------------------------------------------------------------------

/**
 * Extension hooks allow OSS to emit events that managed tier can process.
 * OSS implementations are no-ops; managed tier provides real handlers.
 *
 * This is the architectural boundary: OSS emits, managed handles.
 */

/**
 * Audit hook - OSS emits security-relevant events
 */
export interface AuditHook {
  /**
   * Log an auditable action (no-op in OSS)
   */
  log(event: AuditEvent): Promise<void>;

  /**
   * Query audit logs (throws in OSS)
   */
  query(params: AuditQueryParams): Promise<never>;
}

export interface AuditEvent {
  action: string;
  actorId: EntityId;
  resourceType: string;
  resourceId: EntityId;
  workspaceId: EntityId;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface AuditQueryParams {
  workspaceId: EntityId;
  startDate: Date;
  endDate: Date;
  actorId?: EntityId;
  action?: string;
  limit?: number;
}

/**
 * Search hook - OSS emits indexable content
 */
export interface SearchHook {
  /**
   * Index content (no-op in OSS)
   */
  index(event: SearchIndexEvent): Promise<void>;

  /**
   * Search indexed content (throws in OSS)
   */
  search(params: SearchParams): Promise<never>;
}

export interface SearchIndexEvent {
  documentType: 'message' | 'doc' | 'board';
  documentId: EntityId;
  workspaceId: EntityId;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SearchParams {
  workspaceId: EntityId;
  query: string;
  types?: ('message' | 'doc' | 'board')[];
  limit?: number;
}

/**
 * AI hook - OSS emits context for AI processing
 */
export interface AIHook {
  /**
   * Process AI request (throws in OSS)
   */
  process(request: AIRequest): Promise<never>;

  /**
   * Store AI memory (no-op in OSS)
   */
  storeMemory(memory: AIMemory): Promise<void>;
}

export interface AIRequest {
  type: 'completion' | 'embedding' | 'agent';
  workspaceId: EntityId;
  context: string;
  systemPrompt?: string;
}

export interface AIMemory {
  agentId: EntityId;
  workspaceId: EntityId;
  key: string;
  value: string;
  expiresAt?: number;
}

/**
 * Notification hook - OSS emits notification requests
 */
export interface NotificationHook {
  /**
   * Send push notification (no-op in OSS)
   */
  sendPush(notification: PushNotification): Promise<void>;

  /**
   * Register device token (no-op in OSS)
   */
  registerDevice(token: DeviceToken): Promise<void>;
}

export interface PushNotification {
  userId: EntityId;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface DeviceToken {
  userId: EntityId;
  platform: 'ios' | 'android' | 'web';
  token: string;
}

/**
 * KMS hook - OSS emits encryption requests
 */
export interface KMSHook {
  /**
   * Encrypt data with managed key (throws in OSS)
   */
  encrypt(data: string, keyId?: string): Promise<never>;

  /**
   * Decrypt data with managed key (throws in OSS)
   */
  decrypt(ciphertext: string, keyId?: string): Promise<never>;

  /**
   * Rotate encryption key (throws in OSS)
   */
  rotateKey(keyId: string): Promise<never>;
}

// -----------------------------------------------------------------------------
// Composite Extension Interface
// -----------------------------------------------------------------------------

/**
 * All extension hooks bundled together.
 * OSS provides stub implementations; managed provides real ones.
 */
export interface ExtensionHooks {
  audit: AuditHook;
  search: SearchHook;
  ai: AIHook;
  notification: NotificationHook;
  kms: KMSHook;
}

/**
 * Event bus for extension hooks.
 * Allows managed tier to subscribe to OSS events.
 */
export interface ExtensionEventBus {
  /**
   * Emit event to extension handlers
   */
  emit(event: ExtensionEvent): Promise<void>;

  /**
   * Subscribe to extension events (managed tier only)
   */
  subscribe(
    eventType: ExtensionEvent['type'],
    handler: (event: ExtensionEvent) => Promise<void>
  ): () => void;
}

export type ExtensionEvent =
  | { type: 'audit'; payload: AuditEvent }
  | { type: 'search.index'; payload: SearchIndexEvent }
  | { type: 'ai.memory'; payload: AIMemory }
  | { type: 'notification.push'; payload: PushNotification }
  | { type: 'notification.device'; payload: DeviceToken };

// -----------------------------------------------------------------------------
// OSS Stub Factory
// -----------------------------------------------------------------------------

/**
 * Creates stub implementations for managed-only features in OSS.
 * All hooks are no-ops or throw with clear error messages.
 */
export function createOSSStubs(): ExtensionHooks {
  const managedOnlyError = (feature: string, operation: string): never => {
    throw new Error(
      `[KIIAREN] ${operation} requires managed tier. ` +
        `Feature '${feature}' is not available in self-hosted deployments. ` +
        `See https://kiiaren.io/docs/editioning for details.`
    );
  };

  return {
    audit: {
      log: async () => {
        /* no-op in OSS */
      },
      query: () => managedOnlyError('audit_logs', 'Audit log query'),
    },
    search: {
      index: async () => {
        /* no-op in OSS */
      },
      search: () => managedOnlyError('indexed_search', 'Full-text search'),
    },
    ai: {
      process: () => managedOnlyError('ai_agents', 'AI processing'),
      storeMemory: async () => {
        /* no-op in OSS */
      },
    },
    notification: {
      sendPush: async () => {
        /* no-op in OSS */
      },
      registerDevice: async () => {
        /* no-op in OSS */
      },
    },
    kms: {
      encrypt: () => managedOnlyError('kms', 'KMS encryption'),
      decrypt: () => managedOnlyError('kms', 'KMS decryption'),
      rotateKey: () => managedOnlyError('kms', 'Key rotation'),
    },
  };
}
