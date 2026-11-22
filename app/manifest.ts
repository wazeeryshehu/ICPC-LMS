import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ICPC Digital Learning and Capacity Development Portal",
    short_name: "ICPC Learning",
    description:
      "Official digital learning, capacity development and professional certification portal of the Independent Corrupt Practices and Other Related Offences Commission (ICPC).",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4f7fc",
    theme_color: "#0b2550",
    lang: "en-NG",
    dir: "ltr",
    categories: ["education", "productivity", "government"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My dashboard", short_name: "Dashboard", url: "/dashboard" },
      { name: "Course catalogue", short_name: "Courses", url: "/courses" },
      { name: "My certificates", short_name: "Certificates", url: "/certificates" },
    ],
  };
}
