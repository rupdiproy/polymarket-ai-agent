import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-mock.js",
    },
  },
  webpack: (config: any) => {
    if (!config.resolve) config.resolve = {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": require.resolve("./async-storage-mock.js"),
    };
    return config;
  },
};

export default nextConfig;
