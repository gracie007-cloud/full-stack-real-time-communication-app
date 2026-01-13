#!/bin/bash
# CI Guard: Fail if forbidden Convex imports appear outside allowed directories
#
# This script is a second line of defense alongside ESLint rules.
# It ensures no direct Convex imports creep into UI code.
#
# Allowed directories (where Convex imports ARE permitted):
# - lib/provider/     - Backend provider abstraction
# - lib/backend/      - Backend hooks abstraction
# - features/*/api/   - Feature API hooks (planned migration to lib/backend)
# - components/backend-provider.tsx
# - components/convex-client-provider.tsx
# - app/(app)/layout.tsx
# - middleware.ts
#
# This is a SOFT guard that will warn but not fail for now,
# until the codebase is fully migrated to provider abstractions.

set -e

echo "Checking for forbidden Convex imports..."

# Count imports in disallowed locations (UI components, pages, features/*/components)
FORBIDDEN=$(grep -r --include="*.ts" --include="*.tsx" \
  -E "(from ['\"]convex/react|from ['\"]convex/_generated|from ['\"]@convex-dev)" \
  apps/web/app \
  apps/web/components \
  2>/dev/null \
  | grep -v "backend-provider.tsx" \
  | grep -v "convex-client-provider.tsx" \
  | grep -v "layout.tsx" \
  | grep -v "/api/" \
  || true)

if [ -n "$FORBIDDEN" ]; then
  echo ""
  echo "WARNING: Convex imports found in UI code (pages/components):"
  echo "----------------------------------------------------------------------"
  echo "$FORBIDDEN"
  echo "----------------------------------------------------------------------"
  echo ""
  echo "These should be migrated to use @/lib/provider or @/lib/backend."
  echo "(This check is a warning for now, not a blocking error)"
  echo ""
  # Exit 0 for now - change to exit 1 once migration is complete
  exit 0
fi

echo "✓ No forbidden Convex imports found in UI code"
exit 0
