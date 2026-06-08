import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.projuice.co.uk",
        pathname: "/app/uploads/**",
      },
    ],
  },
};

export default nextConfig;
