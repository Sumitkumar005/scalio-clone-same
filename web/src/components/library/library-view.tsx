"use client";

import { ArrowRight, Clapperboard, Download, Flag, Images, LayoutGrid, Loader2, MoreHorizontal, PenSquare, RefreshCw, Sparkles, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  type: "creation" | "post" | "reel";
  kind: "image" | "video";
  source: string;
  title: string;
  status: string;
  cover?: string;
  outputs: { url: string; label: string; preview?: boolean }[];
  href: string;
  flagged?: boolean;
  createdAt: string;
};

const TABS = [
  { id: "", label: "All", Icon: LayoutGrid },
  { id: "image", label: "Images", Icon: Images },
  { id: "video", label: "Videos", Icon: Video },
] as const;

export function LibraryView() {
  const [tab, setTab] = useState<"" | "image" | "video">("");
  const { data, mutate, isLoading, isValidating } = useSWR<{ items: Item[] }>(`/api/creations${tab ? `?kind=${tab}` : ""}`, (p: string) => api<{ items: Item[] }>(p), {
    refreshInterval: (d) => (d?.items.some((i) => i.status === "queued" || i.status === "processing") ? 2000 : 0),
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand"><Sparkles className="size-4" /> Creative library</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">All your creations, in one place.</h1>
          <p className="mt-2 text-muted">Photos, posts and reel plans from every studio.</p>
        </div>
        <button onClick={() => mutate()} className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 font-semibold text-brand shadow-sm hover:bg-mint">
          <RefreshCw className={cn("size-4", isValidating && "animate-spin")} /> Refresh
        </button>
      </header>
      <div className="flex self-start rounded-2xl border border-line bg-white p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button key={label} onClick={() => setTab(id)} className={cn("flex items-center gap-2 rounded-xl px-4 py-2 font-semibold", tab === id ? "bg-brand text-white" : "text-ink/70 hover:bg-mint")}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="grid h-60 place-items-center"><Loader2 className="size-6 animate-spin text-brand" /></div>
      ) : data?.items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((i) => <LibraryCard key={`${i.type}-${i.id}`} item={i} onChange={() => mutate()} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-semibold">Nothing here yet</p>
          <p className="mt-1 text-muted">Create a photoshoot, mark a calendar post ready, or finish a reel with the director.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/studio" className="rounded-xl bg-brand-bright px-4 py-2 font-semibold text-white">Fashion Studio</Link>
            <Link href="/calendar" className="rounded-xl border border-line px-4 py-2 font-semibold">Calendar</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function LibraryCard({ item, onChange }: { item: Item; onChange: () => void }) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const working = item.status === "queued" || item.status === "processing";
  const statusCls = item.status === "failed" ? "bg-red-50 text-red-600" : working ? "bg-sky-50 text-sky-700" : "bg-mint text-brand";
  const statusLabel = item.status === "published" ? "Published" : working ? "Creating" : item.status === "failed" ? "Failed" : "Ready";

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"><Sparkles className="size-3.5" /> {item.source}</span>
        <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", statusCls)}>
          {working ? <Loader2 className="size-3 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />} {statusLabel}
        </span>
      </div>
      <div className="relative grid aspect-[4/5] place-items-center bg-paper">
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover} alt={item.title} loading="lazy" className="size-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-500 text-white"><Clapperboard className="size-8" /></span>
            <p className="font-display text-lg font-bold">{item.title}</p>
            <p className="text-sm text-muted">Reel plan ready to shoot</p>
          </div>
        )}
        {item.outputs.length > 1 && <span className="absolute right-3 top-3 rounded-lg bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">▢ {item.outputs.length}</span>}
        {item.type === "creation" && (
          <button
            aria-label={item.flagged ? "Reported" : "Report a problem"}
            onClick={async () => { await api(`/api/creations/${item.id}`, { method: "PATCH", json: { flagged: !item.flagged } }); onChange(); }}
            className={cn("absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 shadow", item.flagged && "text-amber-600")}
          >
            <Flag className="size-4" />
          </button>
        )}
        <div ref={ref} className="absolute bottom-3 right-3 flex gap-2">
          <Link href={item.href} aria-label="Open" className="grid size-10 place-items-center rounded-full bg-white shadow hover:bg-mint"><PenSquare className="size-4" /></Link>
          <button aria-label="More" onClick={() => setMenu((m) => !m)} className="grid size-10 place-items-center rounded-full bg-white shadow hover:bg-mint"><MoreHorizontal className="size-4" /></button>
          {menu && (
            <div className="absolute bottom-12 right-0 z-10 w-48 rounded-2xl border border-line bg-white p-1.5 shadow-xl">
              {item.cover && (
                <a href={item.type === "creation" ? `${item.cover}?download` : item.cover} download className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-mint"><Download className="size-4" /> Download</a>
              )}
              {item.type === "creation" && (
                <button
                  onClick={async () => { if (!confirm("Delete this creation?")) return; await api(`/api/creations/${item.id}`, { method: "DELETE" }); onChange(); }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {item.outputs.length > 1 && (
        <div className="border-t border-line px-4 py-3">
          <div className="flex justify-between text-sm"><span className="font-semibold">Outputs</span><span className="text-muted">{item.outputs.length} items</span></div>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {item.outputs.map((o, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={o.url} src={o.url} alt={o.label} className={cn("h-16 w-14 shrink-0 rounded-lg border object-cover", i === 0 ? "border-brand-bright" : "border-line")} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-auto flex items-center justify-between border-t border-line px-4 py-3 text-sm">
        <span className="text-muted">{timeAgo(item.createdAt)}</span>
        <Link href={item.href} className="flex items-center gap-1 font-semibold text-brand">Open result <ArrowRight className="size-4" /></Link>
      </div>
    </article>
  );
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
