import type { NextConfig } from "next";

const nextConfig: any = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { webpackBuildWorker: false },
  turbopack: {},
  webpack: (config) => {
    if (!config.resolve) config.resolve = {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": require.resolve("./async-storage-mock.js"),
    };
    return config;
  },
};

export default nextConfig;
