import { fileURLToPath } from 'node:url';

const serviceAliases = {
  'hyper-performance-web': 'website-development',
  'website-development-engineering': 'website-development',
  'search-ai-visibility': 'seo',
  'search-and-ai-visibility': 'seo',
  'local-dominance-gmb': 'seo',
  'local-growth-gmb': 'seo',
  'paid-media-roas': 'digital-marketing',
  'paid-media-google-ads': 'digital-marketing',
  'social-media-content-systems': 'digital-marketing',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'lucide-react', 'motion'],
  serverExternalPackages: ['@prisma/adapter-better-sqlite3', 'better-sqlite3'],
  async redirects() {
    return Object.entries(serviceAliases).map(([alias, slug]) => ({
      source: `/services/${alias}`,
      destination: `/services/${slug}`,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
