import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';
import { NextResponse } from 'next/server';

const isSignInPage = createRouteMatcher(['/auth']);

export default convexAuthNextjsMiddleware((req) => {
  const host = req.headers.get('host') ?? '';
  const url = req.nextUrl;

  // ---- account.kiiaren.com ----
  // NOTE: Requires 'apps/web/app/account' directory to exist
  if (host === 'account.kiiaren.com') {
    if (!url.pathname.startsWith('/account')) {
      url.pathname = `/account${url.pathname}`;
    }
    // Account subdomain IS the auth page, so it must be public
    // If user is already authenticated, client-side code will redirect to dashboard
    return NextResponse.rewrite(url);
  }

  // ---- dashboard.kiiaren.com ----
  // Maps to the main workspace app (apps/web/app/workspace)
  if (host === 'dashboard.kiiaren.com') {
    // The user's request used '/app', but the project structure uses '/workspace'
    // We map to '/workspace' to ensure it finds the correct files.
    if (!url.pathname.startsWith('/workspace')) {
      url.pathname = `/workspace${url.pathname}`;
    }

    // Protect dashboard
    if (!isSignInPage(req) && !isAuthenticatedNextjs()) {
      return nextjsMiddlewareRedirect(req, '/auth');
    }
    return NextResponse.rewrite(url);
  }

  // ---- auth.kiiaren.com ----
  // Handles Convex Auth callbacks and API requests
  // Maps https://auth.kiiaren.com/callback/google -> /api/auth/callback/google
  if (host === 'auth.kiiaren.com') {
    // Ensure we are hitting the /api/auth path
    if (!url.pathname.startsWith('/api/auth')) {
      // If user hits root of auth.kiiaren.com, what should happen?
      // Probably nothing useful effectively, maybe redirect home?
      // But for strict mapping:
      url.pathname = `/api/auth${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---- api.kiiaren.com ----
  if (host === 'api.kiiaren.com') {
    if (!url.pathname.startsWith('/api')) {
      url.pathname = `/api${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---- help.kiiaren.com ----
  if (host === 'help.kiiaren.com') {
    if (!url.pathname.startsWith('/help')) {
      url.pathname = `/help${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---- doc.kiiaren.com ----
  if (host === 'doc.kiiaren.com') {
    if (!url.pathname.startsWith('/doc')) {
      url.pathname = `/doc${url.pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ---- www.kiiaren.com → kiiaren.com ----
  if (host === 'www.kiiaren.com') {
    url.hostname = 'kiiaren.com';
    return NextResponse.redirect(url);
  }

  // ---- kiiaren.com (marketing/root) ----
  if (host === 'kiiaren.com') {
    // Since there is no dedicated marketing page (it redirects to workspace),
    // we let it pass. If you add a (marketing) folder later, this will serve it.
    return NextResponse.next();
  }

  // ---- Localhost / Fallback ----
  // Standard auth protection for other cases
  if (!isSignInPage(req) && !isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(req, '/auth');
  }

  if (isSignInPage(req) && isAuthenticatedNextjs()) {
    return nextjsMiddlewareRedirect(req, '/');
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|favicon.ico|assets).*)'],
};
