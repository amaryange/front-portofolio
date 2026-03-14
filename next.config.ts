import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "next-mdx-remote",
    "@mdx-js/mdx",
    "shiki",
    "rehype-pretty-code",
  ],
  // Shiki loads language/theme JSON files dynamically — the file tracer
  // won't pick them up automatically, so we include them explicitly so
  // they're present in the standalone Docker image at runtime.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/shiki/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
    return [
      {
        source: "/api/v1/media/:path*",
        destination: `${api}/api/v1/media/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
