import React from 'react';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource-variable/schibsted-grotesk/wght-italic.css';
import '../index.css';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { BRAND } from '@/content/siteContent';

export const metadata: Metadata = {
  title: 'Alphalinkx — Digital Agency & Technology Studio',
  description:
    'Alphalinkx transforms ambitious ideas into measurable digital growth through high-performance web development, intelligent AI solutions, technical SEO, and immersive digital experiences.',
  keywords: [
    'digital agency',
    'web development',
    'three.js',
    'React',
    'AI solutions',
    'digital marketing',
    'SEO agency',
    'technical architecture',
    'app development',
  ],
  authors: [{ name: 'Alphalinkx' }],
  metadataBase: new URL('https://alphalinkx.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    title: 'Alphalinkx — Digital Agency & Technology Studio',
    description:
      'We build digital experiences that move businesses forward. From high-performance websites to intelligent AI solutions and data-driven marketing.',
    images: [BRAND.logo],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alphalinkx — Digital Agency & Technology Studio',
    description:
      'We build digital experiences that move businesses forward. Custom web development, AI automation, and digital marketing.',
    images: [BRAND.logo],
  },
};

export const viewport: Viewport = {
  themeColor: '#F8EEE8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8EEE8] text-[#000000] antialiased selection:bg-[#FF5400] selection:text-white min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
