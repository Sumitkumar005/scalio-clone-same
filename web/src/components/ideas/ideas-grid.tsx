"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { api, useIdeas, type IdeaDTO } from "@/lib/api";
import { IdeaCard } from "./idea-card";

export function IdeasGrid({ limit = 5, status, showRefresh }: { limit?: number; status?: string; showRefresh?: boolean }) {
  const { data, isLoading, mutate } = useIdeas(limit, status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSave = async (idea: IdeaDTO) => {
    const next = idea.status === "saved" ? "new" : "saved";
    mutate((d) => d && { ideas: d.ideas.map((i) => (i._id === idea._id ? { ...i, status: next } : i)) }, { revalidate: false });
    await api(`/api/ideas/${idea._id}`, { method: "PATCH", json: { status: next } });
    if (status) mutate();
  };

  const regenerate = async () => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/ideas/generate", { method: "POST" });
      await mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't make new ideas");
    }
    setBusy(false);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: Math.min(limit, 5) }, (_, i) => <div key={i} className="aspect-[4/6] animate-pulse rounded-2xl bg-white" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showRefresh && (
        <button onClick={regenerate} disabled={busy} className="flex items-center gap-2 self-start rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-mint disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Make more ideas
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data?.ideas.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.ideas.map((i) => <IdeaCard key={i._id} idea={i} onToggleSave={toggleSave} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-muted">
          {status === "saved" ? "Nothing saved yet. Tap the bookmark on any idea." : "No ideas yet."}
        </p>
      )}
    </div>
  );
}
