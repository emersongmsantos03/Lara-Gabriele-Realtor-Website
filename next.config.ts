import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // One canonical host for Google: the bare domain permanently redirects to www.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "pacificfriendlyrealty.com" }],
        destination: "https://www.pacificfriendlyrealty.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
