import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  onDemandEntries: {
    maxInactiveAge: 15000,
    pagesBufferLength: 1,
  },
};

export default nextConfig;
