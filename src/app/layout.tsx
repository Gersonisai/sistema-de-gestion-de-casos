
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'YASI K\'ARI',
  description: 'Gestión de Casos Legales',
  manifest: '/manifest.json', // Added manifest link for PWA
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="application-name" content="YASI K'ARI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="YASI K'ARI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#526691" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#526691" />

        {/* Add to homescreen for Chrome on Android. Fallback for manifest.json */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" /> {/* Using 192 as a substitute for 180 */}
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" /> {/* Using 192 as a substitute for 167 */}

        {/* Favicon links - user needs to add these files */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        {/* <link rel="shortcut icon" href="/favicon.ico" /> */}

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
