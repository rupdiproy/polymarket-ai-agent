import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-mock.js",
    },
  },
};

export default nextConfig;
