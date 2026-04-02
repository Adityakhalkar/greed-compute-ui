/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://compute.deep-ml.com',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://compute.deep-ml.com/:path*',
      },
    ]
  },
}

export default nextConfig
