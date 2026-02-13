import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Roasted",
    short_name: "Roasted",
    description:
      "Track roast timers and inventory for your coffee roasts on any device.",
    start_url: "/inventory",
    scope: "/",
    display: "standalone",
    background_color: "#f7f2ea",
    theme_color: "#f7f2ea",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
