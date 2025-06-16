/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gallerycdn.vsassets.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vsassets.io',
      },
    ],
  },
};

export default nextConfig;
