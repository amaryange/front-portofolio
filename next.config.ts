import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Empêche webpack de bundler ces packages — ils sont chargés depuis
  // node_modules à runtime. Sans ça, shiki et next-mdx-remote peuvent
  // avoir des problèmes avec les imports dynamiques lors du bundling.
  serverExternalPackages: [
    "next-mdx-remote",
    "@mdx-js/mdx",
    "shiki",
    "rehype-pretty-code",
  ],
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
