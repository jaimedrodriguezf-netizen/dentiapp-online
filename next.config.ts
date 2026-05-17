import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence turbopack root warning in dev
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
