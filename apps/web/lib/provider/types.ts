/**
 * Provider runtime types for apps/web
 *
 * These types extend @kiiaren/core types with React-specific patterns.
 */

import type { BackendProvider, ManagedFeature } from '@kiiaren/core';

/**
 * Provider selection from environment
 */
export type ProviderType = 'convex' | 'self-host';

/**
 * Provider context value exposed to React components
 */
export interface BackendContextValue {
  /**
   * The active backend provider instance
   */
  provider: BackendProvider;

  /**
   * Whether the provider is ready to use
   */
  isReady: boolean;

  /**
   * Initialization error, if any
   */
  error: Error | null;

  /**
   * Check if a managed feature is available
   */
  isFeatureAvailable: (feature: ManagedFeature) => boolean;

  /**
   * Require a managed feature, throw if not available
   */
  requireManagedFeature: (feature: ManagedFeature) => void;
}

/**
 * Provider configuration from environment
 */
export interface ProviderEnvConfig {
  provider: ProviderType;
  convexUrl?: string;
  selfHostDatabaseUrl?: string;
  selfHostWebsocketUrl?: string;
}

/**
 * Get provider type from environment
 */
export function getProviderType(): ProviderType {
  const env = process.env.NEXT_PUBLIC_KIIAREN_PROVIDER;
  if (env === 'self-host') return 'self-host';
  return 'convex'; // default
}

/**
 * Get provider configuration from environment
 */
export function getProviderConfig(): ProviderEnvConfig {
  return {
    provider: getProviderType(),
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    selfHostDatabaseUrl: process.env.KIIAREN_DATABASE_URL,
    selfHostWebsocketUrl: process.env.NEXT_PUBLIC_KIIAREN_WS_URL,
  };
}
