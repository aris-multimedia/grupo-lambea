import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "grupolambea.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
