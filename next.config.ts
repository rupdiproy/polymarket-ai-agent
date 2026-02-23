import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./async-storage-mock.js",
      "crypto": "crypto-browserify",
      "stream": "stream-browserify",
    },
  },
  webpack: (config: any) => {
    if (!config.resolve) config.resolve = {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": require.resolve("./async-storage-mock.js"),
    };
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert'),
      os: require.resolve('os-browserify'),
      path: require.resolve('path-browserify'),
    };
    return config;
  },
};

export default nextConfig;
