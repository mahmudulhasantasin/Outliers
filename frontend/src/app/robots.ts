import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://advotech-copilot.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/docs",
          "/contractmind",
          "/copilot",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/lawyer",
          "/lawyer/*",
          "/enterprise",
          "/enterprise/*",
          "/profile",
          "/profile/*",
          "/settings",
          "/settings/*",
          "/archive",
          "/archive/*",
          "/demo-admin",
          "/demo-lawyer",
          "/demo-user",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
