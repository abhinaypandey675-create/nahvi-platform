import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${process.env.NEXTAUTH_URL || "https://your-domain.com"}/sitemap.xml`,
  };
}
