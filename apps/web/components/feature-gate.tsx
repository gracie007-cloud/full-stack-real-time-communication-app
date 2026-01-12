'use client';

/**
 * Feature Gate Component
 *
 * Conditionally renders children based on managed provider status.
 * Used to gate managed-only features in the UI.
 *
 * @example
 * ```tsx
 * <FeatureGate feature="indexed_search" fallback={<BasicSearch />}>
 *   <IndexedSearch />
 * </FeatureGate>
 * ```
 */

import type { ReactNode } from 'react';
import type { ManagedFeature } from '@kiiaren/core';
import { useManagedFeature, useIsManaged } from '@/lib/provider';

interface FeatureGateProps {
  /**
   * The managed feature to check
   */
  feature: ManagedFeature;

  /**
   * Content to render if feature is available
   */
  children: ReactNode;

  /**
   * Content to render if feature is NOT available (optional)
   */
  fallback?: ReactNode;
}

/**
 * Gate content based on managed feature availability.
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isAvailable = useManagedFeature(feature);

  if (!isAvailable) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ManagedOnlyProps {
  /**
   * Content to render if provider is managed
   */
  children: ReactNode;

  /**
   * Content to render if provider is NOT managed (optional)
   */
  fallback?: ReactNode;
}

/**
 * Gate content to managed providers only.
 *
 * @example
 * ```tsx
 * <ManagedOnly fallback={<SelfHostNotice />}>
 *   <EnterpriseFeatures />
 * </ManagedOnly>
 * ```
 */
export function ManagedOnly({ children, fallback = null }: ManagedOnlyProps) {
  const isManaged = useIsManaged();

  if (!isManaged) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface SelfHostOnlyProps {
  /**
   * Content to render if provider is self-hosted
   */
  children: ReactNode;

  /**
   * Content to render if provider is NOT self-hosted (optional)
   */
  fallback?: ReactNode;
}

/**
 * Gate content to self-hosted providers only.
 *
 * @example
 * ```tsx
 * <SelfHostOnly>
 *   <DatabaseConfigPanel />
 * </SelfHostOnly>
 * ```
 */
export function SelfHostOnly({ children, fallback = null }: SelfHostOnlyProps) {
  const isManaged = useIsManaged();

  if (isManaged) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to show "managed only" notice for unavailable features.
 */
export function ManagedFeatureNotice({ feature }: { feature: ManagedFeature }) {
  return (
    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
      <p className="font-medium">Feature not available</p>
      <p className="mt-1">
        <code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">{feature}</code> requires
        KIIAREN Managed Cloud.
      </p>
      <p className="mt-2 text-xs">
        Self-hosted deployments do not include this feature.
        See docs/EDITIONING.md for details.
      </p>
    </div>
  );
}
