import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "static.vecteezy.com" },
    ],
  },
  turbopack: {
    // Pin the workspace root to this project directory.
    // Prevents Next.js from mis-detecting the root when multiple
    // package-lock.json files exist on the machine (e.g. C:\Users\Admin\).
    root: __dirname,
  },
};

export default nextConfig;
