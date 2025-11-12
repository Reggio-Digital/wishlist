import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  generateBuildId: async () => `build-${Date.now()}`,
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
