/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mui/x-date-pickers'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      timers: false
    }
    return config
  }
}

export default nextConfig
