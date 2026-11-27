import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Advotech Copilot - Sovereign Legal AI",
    short_name: "Advotech Copilot",
    description: "Sovereign Contract Intelligence & Legal AI for Bangladesh Law",
    start_url: "/",
    display: "standalone",
    background_color: "#1D1D1B",
    theme_color: "#1D1D1B",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
