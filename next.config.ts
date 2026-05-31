import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence turbopack root warning in dev
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      html2canvas: './src/lib/html2canvas-wrapper.ts',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      html2canvas: path.resolve(__dirname, 'src/lib/html2canvas-wrapper.ts'),
    };
    return config;
  },
  allowedDevOrigins: ["100.66.182.124"],
};

export default nextConfig;


