/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  images: {
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  },
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Ensure proper handling of static assets for Electron
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
    }
    return config;
  }
}

module.exports = nextConfig
