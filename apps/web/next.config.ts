import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: process.env.NODE_ENV === "production",
  transpilePackages: ["@betflow/shared"],
};

export default nextConfig;
