import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/partner"],
      },
    ],
    sitemap: "https://campuskey.co.ke/sitemap.xml",
  };
}
