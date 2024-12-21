/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'], // Add your Supabase project URL here
  },
};

module.exports = nextConfig;
