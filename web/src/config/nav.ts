import { CalendarDays, Clapperboard, House, Images, Settings, Shirt } from "lucide-react";

/** Top-level app sections. Mirrors the product map in docs/SCRAPE_REPORT.md. */
export const NAV = [
  { href: "/home", label: "Home", icon: House },
  { href: "/director", label: "Director", icon: Clapperboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/studio", label: "Fashion Studio", short: "Studio", icon: Shirt },
  { href: "/library", label: "Library", icon: Images },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/** Name of the AI video director persona. */
export const DIRECTOR_NAME = "Kira";
