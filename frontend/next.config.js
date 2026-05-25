/** @type {import('next').NextConfig} */
// Server-side proxy target. In-cluster this points at the backend Service.
// The browser always uses relative URLs (NEXT_PUBLIC_API_URL is kept empty).
const BACKEND_URL = process.env.BACKEND_URL || "http://dclaw-learn-backend:8093";

const nextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${BACKEND_URL}/health/:path*`,
      },
      {
        source: "/health",
        destination: `${BACKEND_URL}/health`,
      },
    ];
  },
};

module.exports = nextConfig;
