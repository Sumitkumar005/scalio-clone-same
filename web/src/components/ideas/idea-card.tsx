"use client";

import { Bookmark, BookmarkCheck, Briefcase, Clapperboard, Laptop, Smartphone, User, UserX } from "lucide-react";
import type { IdeaDTO } from "@/lib/api";
import { cn } from "@/lib/utils";

const PALETTES = [
  ["from-slate-200 to-slate-400", "from-sky-100 to-sky-300", "from-stone-200 to-stone-400", "from-indigo-100 to-indigo-300"],
  ["from-emerald-100 to-emerald-300", "from-teal-100 to-cyan-300", "from-lime-100 to-green-300", "from-green-100 to-emerald-200"],
  ["from-amber-100 to-orange-300", "from-rose-100 to-rose-300", "from-yellow-100 to-amber-300", "from-orange-100 to-red-200"],
  ["from-violet-100 to-fuchsia-300", "from-pink-100 to-pink-300", "from-purple-100 to-violet-300", "from-fuchsia-100 to-pink-200"],
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function sceneIcon(visual: string) {
  const v = visual.toLowerCase();
  if (/laptop|screen|website|dashboard/.test(v)) return Laptop;
  if (/phone|tablet|mobile/.test(v)) return Smartphone;
  if (/presenter|counsellor|doctor|owner|speaking|talking|student|customer|model/.test(v)) return User;
  if (/office|desk/.test(v)) return Briefcase;
  return Clapperboard;
}

/** Storyboard preview. Each cell becomes a real generated frame once image models are wired in. */
export function IdeaCard({ idea, onToggleSave }: { idea: IdeaDTO; onToggleSave?: (idea: IdeaDTO) => void }) {
  const pal = PALETTES[hash(idea.tag) % PALETTES.length];
  const cells = idea.scenes.slice(0, 4);
  const saved = idea.status === "saved";
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative grid aspect-[4/5] grid-cols-2 grid-rows-2 gap-0.5 bg-line">
        {cells.map((s, i) => {
          const Icon = sceneIcon(s.visual);
          return (
            <div key={s.n} className={cn("relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br p-3 text-center", pal[i % pal.length])}>
              {i > 0 && <span className="absolute left-2 top-2 text-sm font-bold text-white drop-shadow">{s.n}</span>}
              <Icon className="size-8 text-white drop-shadow" strokeWidth={1.4} />
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-ink/70">{s.caption}</span>
            </div>
          );
        })}
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow">{idea.tag}</span>
        {onToggleSave && (
          <button
            aria-label={saved ? "Remove from library" : "Save to library"}
            onClick={() => onToggleSave(idea)}
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow transition group-hover:opacity-100 data-[saved=true]:opacity-100"
            data-saved={saved}
          >
            {saved ? <BookmarkCheck className="size-4 text-brand" /> : <Bookmark className="size-4" />}
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] font-semibold leading-snug text-ink">{idea.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{idea.hook}</p>
        <p className="mt-auto flex items-center gap-2 pt-3 text-xs text-muted">
          {idea.durationSec}s <span>·</span>
          {idea.presenter ? <User className="size-3.5" /> : <UserX className="size-3.5" />}
          {idea.presenter ? "Presenter" : "No presenter"}
        </p>
      </div>
    </article>
  );
}
