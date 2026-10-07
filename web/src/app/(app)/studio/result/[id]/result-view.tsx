"use client";

import { AlertTriangle, ArrowLeft, Download, Flag, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { api, useMe } from "@/lib/api";
import type { CreationStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

type CreationDTO = {
  _id: string;
  title: string;
  source: string;
  status: CreationStatus;
  inputUrl?: string;
  outputs: { url: string; label: string; width: number; height: number; preview: boolean }[];
  params: { kind: "photoshoot" | "pack"; count?: number };
  creditsCharged: number;
  flagged?: boolean;
  error?: string;
};

export function ResultView({ id }: { id: string }) {
  const { mutate: refreshMe } = useMe();
  const { data, mutate, error } = useSWR<{ creation: CreationDTO }>(`/api/creations/${id}`, (p: string) => api<{ creation: CreationDTO }>(p), {
    refreshInterval: (d) => (d && (d.creation.status === "ready" || d.creation.status === "failed") ? 0 : 1500),
    onSuccess: (d) => {
      if (d.creation.status === "ready" || d.creation.status === "failed") refreshMe();
    },
  });
  if (error) return <p className="text-muted">This result was not found.</p>;
  if (!data) return <Loader2 className="size-6 animate-spin text-brand" />;
  const c = data.creation;
  const expected = c.params.kind === "pack" ? 4 : (c.params.count ?? 1);
  const working = c.status === "queued" || c.status === "processing";
  const preview = c.outputs.some((o) => o.preview);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/studio" className="flex items-center gap-1 self-start text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> Fashion Studio</Link>
      <header className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">{c.params.kind === "pack" ? "Marketplace pack" : "Fashion photoshoot"}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">{c.title}</h1>
        </div>
        <StatusBadge status={c.status} done={c.outputs.length} total={expected} />
        <button
          onClick={async () => { await api(`/api/creations/${id}`, { method: "PATCH", json: { flagged: !c.flagged } }); mutate(); }}
          className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold", c.flagged ? "border-amber-300 bg-amber-50 text-amber-700" : "border-line hover:bg-mint")}
        >
          <Flag className="size-4" /> {c.flagged ? "Reported" : "Report a problem"}
        </button>
      </header>

      {preview && (
        <p className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Preview mode: no image model is connected, so these show your garment on the chosen scene. Add <code className="rounded bg-white px-1">FAL_KEY</code> to .env.local to generate real model photos.
        </p>
      )}
      {c.status === "failed" && (
        <p className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <RotateCcw className="size-4" /> This didn&apos;t work: {c.error}. Your {c.creditsCharged} credits were refunded.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[260px_1fr]">
        {c.inputUrl && (
          <div className="rounded-3xl border border-line bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-muted">Your garment</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.inputUrl} alt="Input garment" className="aspect-[3/4] w-full rounded-2xl object-contain" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: expected }, (_, i) => {
            const o = c.outputs[i];
            return o ? (
              <figure key={i} className="overflow-hidden rounded-3xl border border-line bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.url} alt={o.label} className="w-full" style={{ aspectRatio: `${o.width}/${o.height}` }} />
                <figcaption className="flex items-center gap-2 p-3 text-sm">
                  <span className="flex-1 truncate font-semibold">{o.label}</span>
                  <a href={`${o.url}?download`} aria-label="Download" className="grid size-9 place-items-center rounded-full border border-line hover:bg-mint"><Download className="size-4" /></a>
                </figcaption>
              </figure>
            ) : (
              <div key={i} className="grid aspect-[3/4] place-items-center rounded-3xl border border-dashed border-line bg-white">
                {working ? <Loader2 className="size-6 animate-spin text-brand" /> : <span className="text-sm text-muted">—</span>}
              </div>
            );
          })}
        </div>
      </div>
      {c.status === "ready" && (
        <div className="flex gap-3">
          <Link href="/library" className="rounded-xl border border-line px-4 py-2.5 font-semibold hover:bg-mint">Open Library</Link>
          <Link href={c.params.kind === "pack" ? "/studio/pack" : "/studio/photoshoot"} className="rounded-xl bg-brand-bright px-4 py-2.5 font-semibold text-white hover:bg-brand">Make another</Link>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, done, total }: { status: CreationStatus; done: number; total: number }) {
  const map = {
    queued: ["Queued", "bg-slate-100 text-slate-700"],
    processing: [`Creating ${done}/${total}`, "bg-sky-100 text-sky-700"],
    ready: ["Ready", "bg-mint text-brand"],
    failed: ["Failed", "bg-red-100 text-red-700"],
  } as const;
  const [label, cls] = map[status];
  return <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold", cls)}>{(status === "processing" || status === "queued") && <Loader2 className="size-3.5 animate-spin" />}{label}</span>;
}
