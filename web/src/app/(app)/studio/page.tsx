import { ArrowRight, Camera, Shirt, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { MARKETPLACES, MODELS, PACK_POSES } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const metadata = { title: "Fashion Studio" };

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand"><Sparkles className="size-4" /> Fashion Studio</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Choose your photoshoot</h1>
        <p className="mt-2 text-muted">Style your own look, or get a ready-to-list photo pack.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <Link href="/studio/photoshoot" className="group overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="grid grid-cols-[1.1fr_1fr] gap-3 bg-mint/70 p-4">
            <div className="relative grid aspect-[4/5] place-items-center rounded-2xl bg-gradient-to-b from-rose-200 via-amber-100 to-orange-200">
              <Shirt className="size-24 text-white drop-shadow" strokeWidth={1.1} />
              <span className="absolute bottom-3 left-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">LOOK PREVIEW</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-brand">Model look</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {MODELS.slice(0, 3).map((m) => (
                    <span key={m.id} className={cn("grid aspect-square place-items-center rounded-xl bg-gradient-to-br", m.tone)}><User className="size-7 text-white" /></span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-semibold"><span className="grid size-10 place-items-center rounded-lg bg-slate-200"><User className="size-5" /></span> Choose a pose</div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-semibold"><span className="size-10 rounded-lg bg-gradient-to-b from-sky-200 to-amber-200" /> Set the scene</div>
            </div>
          </div>
          <CardFooter kicker="Your creative direction" title="Fashion Photoshoot" body="Pick the model, pose, scene and styling for each garment." cta="Create a photoshoot" />
        </Link>

        <Link href="/studio/pack" className="group overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="bg-mint/70 p-4">
            <div className="grid grid-cols-5 gap-2">
              {MARKETPLACES.map((m) => (
                <span key={m.id} className="flex flex-col items-center gap-1 rounded-xl bg-white py-2 text-xs font-semibold">
                  <span className="grid size-8 place-items-center rounded-lg bg-ink font-display text-sm font-extrabold text-white">{m.label[0]}</span>
                  {m.label}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PACK_POSES.map((p, i) => (
                <span key={p} className={cn("relative grid aspect-[3/4] place-items-center rounded-xl bg-gradient-to-b", ["from-fuchsia-300 to-rose-400", "from-rose-300 to-pink-400", "from-pink-300 to-fuchsia-400", "from-rose-400 to-red-400"][i])}>
                  <Camera className="size-8 text-white/90" strokeWidth={1.3} />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white">{p}</span>
                </span>
              ))}
            </div>
          </div>
          <CardFooter kicker="One garment · four photos" title="Marketplace Photo Pack" body="Four clean catalogue poses, sized for the marketplaces you sell on." cta="Create a photo pack" />
        </Link>
      </div>
    </div>
  );
}

function CardFooter({ kicker, title, body, cta }: { kicker: string; title: string; body: string; cta: string }) {
  return (
    <div className="p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-brand">{kicker}</p>
      <h2 className="mt-1 font-display text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-muted">{body}</p>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="text-lg font-semibold text-brand">{cta}</span>
        <span className="grid size-11 place-items-center rounded-full bg-brand text-white transition group-hover:translate-x-1"><ArrowRight className="size-5" /></span>
      </div>
    </div>
  );
}
