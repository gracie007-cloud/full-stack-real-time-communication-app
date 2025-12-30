'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { useConvexAuth } from 'convex/react';
import { Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleStart = () => {
    if (isLoading || isRedirecting) return;

    if (isAuthenticated) {
      // If logged in, go to dashboard
      // Check if we are in production or local
      const isProd = window.location.hostname.includes('kiiaren.com');
      if (isProd) {
        window.location.href = 'https://dashboard.kiiaren.com';
      } else {
        // Local: go to workspace root logic
        // We can't go to /workspace directly because we don't know the ID yet
        // But wait, apps/web/app/workspace/page.tsx handles the finding of ID.
        // So we can link to a route that renders that component.
        // But that component is at /workspace/page.tsx.
        // The route is /workspace.
        router.push('/workspace');
      }
    } else {
      // Not logged in: go to account/login
      const isProd = window.location.hostname.includes('kiiaren.com');
      if (isProd) {
        window.location.href = 'https://account.kiiaren.com';
      } else {
        router.push('/account');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Welcome to KIIAREN
        </h1>
        <p className="text-xl text-muted-foreground">
          Your new productivity platform.
        </p>

        <div className="flex gap-4">
          <Button size="lg" onClick={handleStart} className="text-lg px-8" disabled={isLoading}>
            {isLoading ? <Loader className="size-5 animate-spin" /> : (isAuthenticated ? 'Open App' : 'Get Started')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
