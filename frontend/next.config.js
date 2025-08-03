/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  },
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true
}

module.exports = nextConfig 