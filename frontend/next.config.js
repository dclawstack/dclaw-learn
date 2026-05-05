/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/learn/:path*",
        destination: "http://localhost:8093/api/v1/learn/:path*",
      },
      {
        source: "/health",
        destination: "http://localhost:8093/health",
      },
    ];
  },
};

module.exports = nextConfig;
