import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy for the public pages: only our own scripts, plus the
// few outside services the site really uses (map tiles, YouTube, Google Maps).
// The /admin pages get a stricter, per-request policy from src/proxy.ts.
const publicCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https://*.public.blob.vercel-storage.com",
  `connect-src 'self'${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  // Always HTTPS, for two years, including subdomains.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Database drivers run on the server only, unbundled.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Public pages (everything except /admin, which sets its own nonce-based policy).
      { source: "/((?!admin).*)", headers: [{ key: "Content-Security-Policy", value: publicCsp }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
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
      {
        // Blog photos uploaded from /admin (Vercel Blob).
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
