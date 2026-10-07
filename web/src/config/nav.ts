import { Bot, CalendarDays, Clapperboard, CreditCard, House, ImagePlus, TrendingUp } from "lucide-react";

/** App sections. Mirrors the product map in docs/SCRAPE_REPORT.md. */
export const NAV = [
  { href: "/home", label: "Home", icon: House },
  { href: "/studio", label: "Photo Studio", icon: ImagePlus },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/growth", label: "Growth", icon: TrendingUp },
  { href: "/copilot", label: "Copilot", icon: Bot },
  { href: "/billing", label: "Plan", icon: CreditCard },
] as const;
