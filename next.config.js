/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ijdlmwzwulhfdqapgtat.supabase.co',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: false, // Disable strict mode temporarily for testing
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

module.exports = nextConfig;
