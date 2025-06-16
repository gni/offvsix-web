/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',
  basePath: '/offvsix-web',
  assetPrefix: '/offvsix-web/',
  publicRuntimeConfig: {
    basePath: '/offvsix-web',
  },
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
