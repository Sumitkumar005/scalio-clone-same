"use client";

import { ArrowRight, Camera, Clapperboard, LayoutGrid, Megaphone, MapPin, Play, Smartphone, Star } from "lucide-react";
import Link from "next/link";
import { IdeasGrid } from "@/components/ideas/ideas-grid";
import { DIRECTOR_NAME } from "@/config/nav";
import { useMe } from "@/lib/api";
import { cn } from "@/lib/utils";

const CREATE = [
  { href: "/director", kicker: "Motion", title: "Create Videos", Icon: Clapperboard, art: "from-[#6b4f3a] via-[#a07a5c] to-[#e9d3bf]", glyph: Play },
  { href: "/calendar", kicker: "Social", title: "Create Social Media Posts", Icon: LayoutGrid, art: "from-[#c9a27e] via-[#e8cfb4] to-[#f6ece1]", glyph: Smartphone },
  { href: "/studio", kicker: "Studio", title: "Create Photoshoot", Icon: Camera, art: "from-[#9fb3c8] via-[#c9d6e3] to-[#eef2f6]", glyph: Camera },
  { href: "/growth", kicker: "Growth", title: "Growth Tools", Icon: Megaphone, art: "from-[#9cb79f] via-[#c8dcc9] to-[#eef5ef]", glyph: MapPin },
];

export function HomeView() {
  const { data: me } = useMe();
  const name = me?.business?.name;
  return (
    <div className="flex flex-col gap-10">
      <Hero />

      <section>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">What will you create today?</h1>
        <p className="mt-2 text-muted">{name ? `Personalized for ${name}. ` : ""}Choose a starting point and bring your next idea to life.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {CREATE.map(({ href, kicker, title, Icon, art, glyph: Glyph }) => (
            <Link key={href} href={href} className={cn("group relative flex aspect-[3/4] flex-col overflow-hidden rounded-3xl bg-gradient-to-b p-3 text-white sm:aspect-[4/5] sm:p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl", art)}>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="grid size-8 place-items-center rounded-lg bg-black/25"><Icon className="size-4" /></span>
                {kicker}
              </span>
              <Glyph className="mx-auto my-auto size-14 text-white/70 sm:size-24 transition group-hover:scale-110" strokeWidth={1} />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-12 sm:p-5 sm:pt-16">
                <span className="font-display text-base font-bold leading-tight sm:text-2xl">{title}</span>
                <span className="hidden size-10 shrink-0 place-items-center rounded-full border border-white/50 bg-white/10 sm:grid"><ArrowRight className="size-5" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Ideas for you</h2>
            {name && <p className="mt-1 text-muted">Personalized for {name}.</p>}
          </div>
          <Link href="/ideas" className="flex items-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 font-semibold text-brand shadow-sm hover:bg-mint">
            View all ideas <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6"><IdeasGrid limit={5} /></div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="relative z-10 max-w-md p-6 md:p-9">
        <p className="font-display text-5xl font-extrabold tracking-tight text-brand">{DIRECTOR_NAME}</p>
        <p className="mt-1 text-xl font-bold">Your video director</p>
        <div className="my-4 h-px w-24 bg-line" />
        <p className="text-muted">Turn a rough idea into a ready-to-post video for your business.</p>
        <Link href="/director" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand/90">
          Create with {DIRECTOR_NAME} <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[58%] md:block">
        <div className="absolute inset-0 bg-brand [clip-path:ellipse(85%_140%_at_100%_100%)]" />
        <div className="absolute right-10 top-1/2 flex -translate-y-1/2 items-center gap-6">
          <div className="flex flex-col gap-3">
            {["Hook in 2 seconds", "Script + scenes", "Captions in Hinglish"].map((t, i) => (
              <span key={t} className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-semibold text-ink shadow-lg animate-float" style={{ animationDelay: `${i * 0.6}s` }}>
                <Star className="size-4 text-brand-bright" /> {t}
              </span>
            ))}
          </div>
          <div className="relative h-52 w-32 rounded-[1.6rem] border-4 border-white bg-gradient-to-b from-emerald-200 to-emerald-500 shadow-2xl">
            <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white"><Play className="ml-0.5 size-6" /></span>
            <span className="absolute inset-x-2 bottom-2 rounded-lg bg-black/40 py-1 text-center text-[10px] font-semibold text-white">Video preview</span>
          </div>
        </div>
      </div>
    </section>
  );
}
