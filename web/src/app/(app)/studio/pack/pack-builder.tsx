"use client";

import { ArrowLeft, Camera, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChoiceGrid, Section } from "@/components/studio/pickers";
import { SubmitBar } from "@/components/studio/submit-bar";
import { Uploader, type Uploaded } from "@/components/studio/uploader";
import { api, useMe } from "@/lib/api";
import { MARKETPLACES, MODELS, PACK_POSES, type MarketplaceId } from "@/lib/domain";
import { cn } from "@/lib/utils";

type ModelId = (typeof MODELS)[number]["id"];

export function PackBuilder() {
  const router = useRouter();
  const { mutate } = useMe();
  const [garment, setGarment] = useState<Uploaded | null>(null);
  const [markets, setMarkets] = useState<MarketplaceId[]>(["myntra", "amazon"]);
  const [modelId, setModel] = useState<ModelId>("aanya");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: MarketplaceId) => setMarkets((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const submit = async () => {
    if (!garment) return;
    setBusy(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/api/studio/jobs", { method: "POST", json: { kind: "pack", inputFileId: garment.id, modelId, marketplaces: markets } });
      mutate();
      router.push(`/studio/result/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the pack");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/studio" className="flex items-center gap-1 self-start text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> Fashion Studio</Link>
      <h1 className="font-display text-3xl font-bold tracking-tight">Marketplace Photo Pack</h1>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Section step={1} title="Your garment"><Uploader value={garment} onChange={setGarment} /></Section>
        </div>
        <div className="flex flex-col gap-5">
          <Section step={2} title="Where will you list it?" hint="We size the photos for each marketplace. Check current image rules in each seller panel.">
            <ChoiceGrid items={MARKETPLACES} value={markets} onChange={toggle} cols="grid-cols-2 sm:grid-cols-5" render={(m) => (
              <div className="flex flex-col items-center gap-1 py-2">
                <span className="grid size-10 place-items-center rounded-xl bg-ink font-display font-extrabold text-white">{(m.label as string)[0]}</span>
                <span className="text-sm font-semibold">{m.label as string}</span>
                <span className="text-xs text-muted">{m.ratio as string} · {m.width as number}px</span>
              </div>
            )} />
          </Section>
          <Section step={3} title="Model">
            <ChoiceGrid items={MODELS} value={modelId} onChange={setModel} cols="grid-cols-2 sm:grid-cols-5" render={(m) => (
              <div className="flex items-center gap-2">
                <span className={cn("grid size-10 place-items-center rounded-lg bg-gradient-to-br", m.tone as string)}><User className="size-5 text-white" /></span>
                <span className="text-sm font-semibold">{m.name as string}</span>
              </div>
            )} />
          </Section>
          <Section step={4} title="You'll get these four photos">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PACK_POSES.map((p) => (
                <div key={p} className="grid aspect-[3/4] place-items-center rounded-2xl bg-gradient-to-b from-slate-100 to-slate-300">
                  <span className="flex flex-col items-center gap-2 text-sm font-semibold text-slate-600"><Camera className="size-7" /> {p}</span>
                </div>
              ))}
            </div>
          </Section>
          <SubmitBar cost={4} disabled={!garment || !markets.length} busy={busy} error={error} onSubmit={submit} label={garment ? "Create photo pack" : "Upload a garment first"} />
        </div>
      </div>
    </div>
  );
}
