/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require("path").resolve("node_modules/o1js"),
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  reactStrictMode: false,
  experimental: {
    urlImports: ["http://127.0.0.1:8081/api/zkprogram"],
  },
};

module.exports = nextConfig;
