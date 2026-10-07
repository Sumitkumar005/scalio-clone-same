import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/home",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#EEFFF4",
    background_color: "#EEFFF4",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
