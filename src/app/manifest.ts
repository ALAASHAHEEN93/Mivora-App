import type { MetadataRoute } from "next";

/** Makes Mivora installable as a home-screen app (standalone, no browser bars). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mivora",
    short_name: "Mivora",
    description: "Familienaktivitäten in deiner Stadt",
    id: "/",
    start_url: "/de",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#392f5a",
    theme_color: "#ffb3ba",
    lang: "de",
    categories: ["kids", "lifestyle", "education"],
    icons: [
      { src: "/app-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
