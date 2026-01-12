/**
 * Provider Runtime Module
 *
 * Central export for the backend provider abstraction layer.
 *
 * USAGE:
 * ```tsx
 * // In layout.tsx
 * import { BackendProvider } from '@/lib/provider';
 *
 * <BackendProvider>
 *   {children}
 * </BackendProvider>
 *
 * // In components
 * import { useBackend, useManagedFeature } from '@/lib/provider';
 *
 * const { provider } = useBackend();
 * const hasIndexedSearch = useManagedFeature('indexed_search');
 * ```
 *
 * PROVIDER SELECTION:
 * Set NEXT_PUBLIC_KIIAREN_PROVIDER environment variable:
 * - "convex" (default): Use Convex managed backend
 * - "self-host": Use self-hosted backend (NOT IMPLEMENTED)
 */

// Context and hooks
export {
  BackendProviderContext,
  useBackend,
  useBackendOptional,
  useManagedFeature,
  useIsManaged,
  useProviderId,
} from './context';

// Provider adapters
export { ConvexBackendProvider, useConvexAuth, useConvexAuthActions, useGenerateUploadUrl } from './convex-adapter';
export { SelfHostBackendProvider } from './self-host-adapter';

// Types
export type { BackendContextValue, ProviderType, ProviderEnvConfig } from './types';
export { getProviderType, getProviderConfig } from './types';

// Re-export core types for convenience
export type {
  BackendProvider,
  AuthProvider,
  EventsProvider,
  PersistenceProvider,
  StorageProvider,
  ManagedFeature,
} from '@kiiaren/core';

export { MANAGED_ONLY_FEATURES, OSS_FEATURES, PROVIDER_IDS } from '@kiiaren/core';
