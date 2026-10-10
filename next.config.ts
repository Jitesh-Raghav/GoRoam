import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TS build errors during Vercel deploy
  },
  // PostHog, proxied through our own domain so ad-blockers don't drop analytics.
  async rewrites() {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const assets = host.replace("://us.i.", "://us-assets.i.").replace("://eu.i.", "://eu-assets.i.");
    return [
      { source: "/ingest/static/:path*", destination: `${assets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${host}/:path*` },
    ];
  },
  // Travel packages moved out of the dashboard into the public, indexable trip gallery.
  async redirects() {
    return [
      { source: "/dashboard/packages", destination: "/itineraries", permanent: true },
      { source: "/dashboard/packages/:slug", destination: "/itineraries/:slug", permanent: true },
    ];
  },
  skipTrailingSlashRedirect: true,
  images: {
    // Google profile pictures from next-auth sessions.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
