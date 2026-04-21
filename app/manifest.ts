import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RecipeBox",
    short_name: "RecipeBox",
    description: "Save and manage your favorite recipes",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7EF",
    theme_color: "#FAF7EF",
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
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    share_target: {
      action: "/share-target",
      method: "GET",
      params: {
        url: "url",
        title: "title",
        text: "text",
      },
    },
  };
}
