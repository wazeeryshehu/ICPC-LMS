import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const serviceWorkerHeaders = [
  { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
  { key: "Service-Worker-Allowed", value: "/" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "9mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/sw.js", headers: serviceWorkerHeaders },
      {
        source: "/api/materials/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'; sandbox" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
