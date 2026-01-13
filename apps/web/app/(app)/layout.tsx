import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { PropsWithChildren } from 'react';

import { BackendProvider } from '@/components/backend-provider';
import { JotaiProvider } from '@/components/jotai-provider';
import { ModalProvider } from '@/components/modal-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config';

import '../globals.css';

const inter = Inter({
    subsets: ['latin'],
});

export const metadata: Metadata = siteConfig;

/**
 * App Layout
 *
 * Full provider stack for authenticated application routes:
 * - ConvexAuthNextjsServerProvider (server-side auth)
 * - BackendProvider (Convex/self-host abstraction)
 * - JotaiProvider (client state)
 * - ModalProvider (dialog management)
 * - Toaster (notifications)
 */
const AppLayout = ({ children }: Readonly<PropsWithChildren>) => {
    return (
        <ConvexAuthNextjsServerProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={`${inter.className} antialiased`}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <BackendProvider>
                            <JotaiProvider>
                                <Toaster richColors closeButton />
                                <ModalProvider />

                                {children}
                            </JotaiProvider>
                        </BackendProvider>
                    </ThemeProvider>
                    <Analytics />
                    <SpeedInsights />
                </body>
            </html>
        </ConvexAuthNextjsServerProvider>
    );
};

export default AppLayout;
