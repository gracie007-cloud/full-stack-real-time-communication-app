import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { PropsWithChildren } from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { siteConfig } from '@/config';

import '../globals.css';

const inter = Inter({
    subsets: ['latin'],
});

export const metadata: Metadata = siteConfig;

/**
 * Marketing Layout
 *
 * Minimal layout for marketing/landing pages:
 * - NO Convex providers
 * - NO auth providers
 * - NO modal/toast providers
 *
 * This keeps the landing page fast and independent of backend state.
 */
const MarketingLayout = ({ children }: Readonly<PropsWithChildren>) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
};

export default MarketingLayout;
