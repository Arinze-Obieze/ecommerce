/** @type {import('next').NextConfig} */
const supabaseImageHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      ...(supabaseImageHost
        ? [
            {
              protocol: 'https',
              hostname: supabaseImageHost,
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
    ],
  },
}

export default nextConfig;
