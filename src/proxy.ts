import { NextResponse, type NextRequest } from "next/server";

// Strict Content Security Policy for the admin: a fresh random nonce per
// request, so only scripts Next.js itself rendered for this response can run
// ('strict-dynamic'). Even if someone slipped HTML into a post, no injected
// script could execute inside the admin, where sessions live.

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // The editor sets inline styles (colors, fonts) on text.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:" + (isDev ? " http://localhost:*" : ""),
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: http://localhost:*" : ""}`,
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: [
    {
      source: "/admin/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
