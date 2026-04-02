/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://compute.deep-ml.com',
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'https://compute.deep-ml.com'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
