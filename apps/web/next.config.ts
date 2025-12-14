import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We removed 'ppr: true' because it causes errors in Next.js 16
  experimental: {
    // optimizedPackageImports: ["@mantine/core"], // Example of other safe experimental options
  },
};

export default nextConfig;