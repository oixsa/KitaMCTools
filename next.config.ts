import type { NextConfig } from "next";

// Content Security Policy matched to the site's actual resource usage:
// - 'unsafe-inline' script-src: the static anti-FOUC theme script in app/layout.tsx
//   (a nonce-based policy would require dynamic rendering; overkill for a static site)
// - 'unsafe-eval' script-src (dev only): React requires eval() in development mode
//   for debugging features; it is never used in production
// - fonts.googleapis.com / fonts.gstatic.com: Material Symbols stylesheet + font files
// - img-src blob: data: : server-icon/circle-generator canvas exports and objectURLs
// - 'unsafe-inline' style-src: Tailwind/next inject inline styles
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // frame-ancestors 'none' in the CSP supersedes X-Frame-Options in modern browsers;
  // XFO is kept for legacy clients only.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
