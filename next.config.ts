import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence turbopack root warning in dev
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ["100.66.182.124"],
};

export default nextConfig;


