import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  transpilePackages: ["@betflow/shared"],
};

export default nextConfig;
