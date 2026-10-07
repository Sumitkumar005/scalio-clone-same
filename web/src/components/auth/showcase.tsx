"use client";

import { CalendarDays, Clapperboard, Download, Globe, Megaphone, MessageCircle, Shirt, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  tab: string;
  title: string;
  body: string;
  art: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    id: "fashion",
    tab: "Fashion",
    title: "A studio shoot from one photo",
    body: "Drop in a flat-lay of any outfit, from a saree to a blazer, and get model shots in new poses and locations in seconds.",
    art: <FashionArt />,
  },
  {
    id: "reels",
    tab: "Reels & Videos",
    title: "Reels that sell while you sleep",
    body: "Pick a format that already performs, add your product, and publish a scroll-stopping reel without filming anything.",
    art: <ReelsArt />,
  },
  {
    id: "calendar",
    tab: "Calendar",
    title: "Thirty days of content, mapped",
    body: "Describe your shop once. Calendar AI plans posts around festivals, sales and slow weeks so you never stare at a blank feed.",
    art: <CalendarArt />,
  },
  {
    id: "growth",
    tab: "Growth",
    title: "Get found, get booked",
    body: "A ready website, ads on Meta and Google, and an AI assistant that replies to every enquiry, all from one dashboard.",
    art: <GrowthArt />,
  },
  {
    id: "app",
    tab: "Get the app",
    title: "Your marketing, in your pocket",
    body: "Install the app on Android or iPhone and create, schedule and reply on the go.",
    art: <AppArt />,
  },
];

const ROTATE_MS = 6000;

export function Showcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const slide = SLIDES[active];

  return (
    <section
      className="relative flex h-full flex-col overflow-hidden bg-[radial-gradient(120%_80%_at_30%_60%,#1d7539_0%,#0b3d1f_45%,#06170d_100%)] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <nav className="flex gap-7 px-10 pt-10" role="tablist" aria-label="Product highlights">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "border-b-2 pb-1 text-[15px] transition",
              i === active ? "border-white text-white" : "border-transparent text-white/60 hover:text-white",
            )}
          >
            {s.tab}
          </button>
        ))}
      </nav>

      <div key={slide.id} className="flex flex-1 items-center justify-center px-10 animate-in">
        {slide.art}
      </div>

      <div className="px-10 pb-14">
        <h2 className="font-display text-4xl font-bold tracking-tight">{slide.title}</h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{slide.body}</p>
        <div className="mt-6 flex gap-1.5">
          {SLIDES.map((s, i) => (
            <span key={s.id} className={cn("h-1 rounded-full transition-all", i === active ? "w-8 bg-white" : "w-3 bg-white/30")} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Illustrations: pure CSS, no third-party assets ---------- */

function Card({ className, children, style }: { className?: string; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style} className={cn("rounded-3xl border border-white/20 bg-white/90 text-ink shadow-2xl shadow-black/40", className)}>
      {children}
    </div>
  );
}

function FashionArt() {
  return (
    <div className="relative h-[420px] w-[460px]">
      <Card className="absolute left-0 top-16 flex h-56 w-44 -rotate-6 flex-col items-center justify-center gap-3">
        <Shirt className="size-20 text-brand" strokeWidth={1.2} />
        <span className="text-xs font-semibold text-muted">your product photo</span>
      </Card>
      <div className="absolute left-40 top-36 z-10 grid size-14 place-items-center rounded-full bg-brand-bright shadow-lg">
        <Sparkles className="size-7 text-white" />
      </div>
      {["from-rose-300 to-amber-200", "from-sky-300 to-indigo-300", "from-emerald-300 to-teal-200"].map((g, i) => (
        <Card
          key={g}
          className={cn("absolute h-48 w-36 bg-gradient-to-br", g)}
          style={{ left: 250 + i * 18, top: i * 90, transform: `rotate(${(i - 1) * 6}deg)` }}
        />
      ))}
    </div>
  );
}

function ReelsArt() {
  return (
    <div className="flex items-end gap-5">
      {[0, 1, 2].map((i) => (
        <Card
          key={i}
          className={cn(
            "relative flex w-40 flex-col justify-end overflow-hidden p-4",
            i === 1 ? "h-[380px] w-48" : "h-80",
            ["bg-gradient-to-b from-amber-200 to-rose-400", "bg-gradient-to-b from-emerald-200 to-emerald-600", "bg-gradient-to-b from-indigo-200 to-fuchsia-400"][i],
          )}
        >
          <Clapperboard className="absolute left-4 top-4 size-6 text-white" />
          <div className="rounded-xl bg-black/40 p-2 text-xs font-semibold text-white">
            {["New drop 🔥", "Watch till the end", "Only 20 left"][i]}
          </div>
          <div className="mt-2 text-[11px] font-medium text-white/90">▶ {["12.4k", "48.1k", "9.8k"][i]} views</div>
        </Card>
      ))}
    </div>
  );
}

function CalendarArt() {
  const marked: Record<number, string> = { 3: "bg-amber-300", 8: "bg-rose-300", 12: "bg-brand-bright", 17: "bg-sky-300", 21: "bg-amber-300", 26: "bg-fuchsia-300" };
  return (
    <Card className="w-[440px] p-6">
      <div className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
        <CalendarDays className="size-5 text-brand" /> November
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="flex aspect-square flex-col items-center justify-center rounded-xl bg-mint text-xs font-semibold">
            {i + 1}
            {marked[i + 1] && <span className={cn("mt-1 size-2 rounded-full", marked[i + 1])} />}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-brand/10 p-3 text-sm font-medium text-brand">Diwali sale teaser · 7:30 PM · Reel</div>
    </Card>
  );
}

function GrowthArt() {
  return (
    <div className="relative h-[420px] w-[460px]">
      <Card className="absolute left-10 top-4 h-80 w-72 p-5">
        <Globe className="size-6 text-brand" />
        <div className="mt-4 font-display text-2xl font-bold leading-tight">Fresh bakes,<br />every morning</div>
        <div className="mt-4 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200" />
        <div className="mt-4 h-9 w-32 rounded-full bg-brand" />
      </Card>
      <Card className="absolute right-0 top-28 w-48 p-4">
        <Megaphone className="size-5 text-brand" />
        <div className="mt-2 text-sm font-semibold">Ad live on Meta + Google</div>
        <div className="mt-1 text-xs text-muted">2,340 people reached today</div>
      </Card>
      <Card className="absolute bottom-0 left-0 w-56 p-4">
        <MessageCircle className="size-5 text-brand" />
        <div className="mt-2 rounded-xl bg-mint p-2 text-xs">Is the chocolate cake eggless?</div>
        <div className="mt-2 ml-6 rounded-xl bg-brand p-2 text-xs text-white">Yes! Order by 6 PM for same-day pickup.</div>
      </Card>
    </div>
  );
}

function AppArt() {
  return (
    <div className="flex items-center gap-10">
      <div className="h-[400px] w-[200px] rounded-[2.5rem] border-[6px] border-white/80 bg-gradient-to-b from-mint to-emerald-200 p-4 shadow-2xl">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-black/20" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-white/80" />
          ))}
        </div>
      </div>
      <Card className="flex flex-col items-center gap-3 p-6">
        <div className="grid size-32 grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} className={cn("rounded-sm", (i * 7) % 3 ? "bg-ink" : "bg-transparent")} />
          ))}
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold"><Download className="size-4" /> Scan to install</span>
      </Card>
    </div>
  );
}
