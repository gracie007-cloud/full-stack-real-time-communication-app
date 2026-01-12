'use client';

/**
 * Backend Provider Component
 *
 * Selects and initializes the appropriate backend provider based on
 * NEXT_PUBLIC_KIIAREN_PROVIDER environment variable.
 *
 * Default: Convex (managed)
 * Alternative: Self-host (not implemented)
 *
 * This component replaces convex-client-provider.tsx and provides:
 * 1. Provider selection based on environment
 * 2. BackendProvider interface via React context
 * 3. Backwards compatibility with existing Convex hooks
 */

import type { ReactNode } from 'react';
import { ConvexBackendProvider } from '@/lib/provider/convex-adapter';
import { SelfHostBackendProvider } from '@/lib/provider/self-host-adapter';
import { getProviderType } from '@/lib/provider/types';

interface BackendProviderProps {
  children: ReactNode;
}

/**
 * Main backend provider component.
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { BackendProvider } from '@/components/backend-provider';
 *
 * <BackendProvider>
 *   {children}
 * </BackendProvider>
 * ```
 *
 * Existing code using useQuery, useMutation, useConvexAuth will continue
 * to work - they're provided by the ConvexBackendProvider internally.
 */
export function BackendProvider({ children }: BackendProviderProps) {
  const providerType = getProviderType();

  if (providerType === 'self-host') {
    return (
      <SelfHostBackendProvider>
        {children}
      </SelfHostBackendProvider>
    );
  }

  // Default: Convex
  return (
    <ConvexBackendProvider>
      {children}
    </ConvexBackendProvider>
  );
}

// Re-export for backwards compatibility
export { ConvexBackendProvider, SelfHostBackendProvider };
