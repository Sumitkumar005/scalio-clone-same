import { Camera, CalendarDays, Clapperboard, Globe, Shirt, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PANELS = {
  welcome: { label: "What you get", line: "Posts, reels and photos that look like you hired an agency.", tiles: [{ g: "from-rose-200 to-amber-100", Icon: Star, t: "Brand post" }, { g: "from-slate-300 to-slate-500", Icon: Clapperboard, t: "Reel" }] },
  goals: { label: "Reels & Videos", line: "Short videos that explain what you sell in under 30 seconds.", tiles: [{ g: "from-emerald-200 to-teal-400", Icon: Clapperboard, t: "Hook" }, { g: "from-amber-200 to-orange-300", Icon: Sparkles, t: "Offer" }] },
  website: { label: "Smart setup", line: "Paste your website once. We pick up your name, products and style.", tiles: [{ g: "from-sky-200 to-indigo-300", Icon: Globe, t: "Your site" }, { g: "from-lime-100 to-emerald-300", Icon: Sparkles, t: "Your profile" }] },
  business: { label: "Calendar AI", line: "A month of posts planned around festivals, sales and your goals.", tiles: [{ g: "from-fuchsia-200 to-pink-300", Icon: CalendarDays, t: "Diwali" }, { g: "from-amber-100 to-yellow-300", Icon: CalendarDays, t: "Sale week" }] },
  instagram: { label: "Fashion Studio", line: "Model photos from a single product shot. No photoshoot needed.", tiles: [{ g: "from-slate-100 to-slate-300", Icon: Shirt, t: "Product" }, { g: "from-orange-200 to-rose-400", Icon: Camera, t: "On model" }] },
} as const;

export type ShowcaseKey = keyof typeof PANELS;

export function SideShowcase({ step }: { step: ShowcaseKey }) {
  const p = PANELS[step];
  return (
    <aside className="hidden h-dvh flex-col justify-center gap-5 bg-[#d6e6dc] p-8 lg:flex">
      <div key={step} className="flex flex-col gap-5 animate-in">
        <div className="grid grid-cols-2 gap-5">
          {p.tiles.map(({ g, Icon, t }) => (
            <div key={t} className={cn("relative grid aspect-[3/4] place-items-center rounded-3xl bg-gradient-to-br shadow-xl", g)}>
              <Icon className="size-16 text-white drop-shadow" strokeWidth={1.3} />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink">{t}</span>
            </div>
          ))}
        </div>
        <div className="rounded-3xl bg-[#3f7a5c] p-7 text-white shadow-xl">
          <p className="text-sm font-bold text-white/80">{p.label}</p>
          <p className="mt-2 text-xl font-bold leading-snug">{p.line}</p>
        </div>
      </div>
    </aside>
  );
}
