'use client';

/**
 * Backend Provider React Context
 *
 * Provides the BackendProvider interface to React components.
 * The actual provider implementation (Convex or SelfHost) is
 * determined at runtime based on NEXT_PUBLIC_KIIAREN_PROVIDER.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { BackendProvider, ManagedFeature } from '@kiiaren/core';
import { MANAGED_ONLY_FEATURES } from '@kiiaren/core';
import type { BackendContextValue } from './types';

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const BackendContext = createContext<BackendContextValue | null>(null);

// -----------------------------------------------------------------------------
// Provider Component
// -----------------------------------------------------------------------------

interface BackendProviderProps {
  children: ReactNode;
  provider: BackendProvider;
  isReady?: boolean;
  error?: Error | null;
}

/**
 * Backend provider wrapper component.
 *
 * This is a generic wrapper - the actual provider implementation
 * (ConvexBackendProvider or SelfHostBackendProvider) should be used
 * in the app layout.
 */
export function BackendProviderContext({
  children,
  provider,
  isReady = true,
  error = null,
}: BackendProviderProps) {
  const value = useMemo<BackendContextValue>(() => ({
    provider,
    isReady,
    error,

    isFeatureAvailable(feature: ManagedFeature): boolean {
      if (!provider.isManaged) {
        // Self-hosted: managed features not available
        return !MANAGED_ONLY_FEATURES.includes(feature);
      }
      // Managed provider: all features available
      return true;
    },

    requireManagedFeature(feature: ManagedFeature): void {
      if (!provider.isManaged && MANAGED_ONLY_FEATURES.includes(feature)) {
        throw new Error(
          `[KIIAREN] Feature '${feature}' requires managed deployment. ` +
          `Self-hosted deployments do not support this feature. ` +
          `See docs/EDITIONING.md for details.`
        );
      }
    },
  }), [provider, isReady, error]);

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Access the backend provider.
 *
 * @throws Error if used outside of BackendProviderContext
 */
export function useBackend(): BackendContextValue {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error(
      'useBackend must be used within a BackendProviderContext. ' +
      'Ensure your component is wrapped with ConvexBackendProvider or SelfHostBackendProvider.'
    );
  }
  return context;
}

/**
 * Access the backend provider, returns null if not available.
 * Useful for optional provider access.
 */
export function useBackendOptional(): BackendContextValue | null {
  return useContext(BackendContext);
}

/**
 * Check if a managed feature is available.
 *
 * @example
 * ```tsx
 * const canUseSearch = useManagedFeature('indexed_search');
 * if (canUseSearch) {
 *   // Show search UI
 * }
 * ```
 */
export function useManagedFeature(feature: ManagedFeature): boolean {
  const { isFeatureAvailable } = useBackend();
  return isFeatureAvailable(feature);
}

/**
 * Get the provider's managed status.
 */
export function useIsManaged(): boolean {
  const { provider } = useBackend();
  return provider.isManaged;
}

/**
 * Get provider identification.
 */
export function useProviderId(): string {
  const { provider } = useBackend();
  return provider.id;
}
