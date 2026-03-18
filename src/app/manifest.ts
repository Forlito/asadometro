import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Asadometro",
    short_name: "Asadometro",
    description: "Medí quién va a más asados con tus amigos",
    start_url: "/home",
    display: "standalone",
    background_color: "#faf5f0",
    theme_color: "#e67e22",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
