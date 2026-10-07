"use client";

import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChoiceGrid, Section } from "@/components/studio/pickers";
import { SubmitBar } from "@/components/studio/submit-bar";
import { Uploader, type Uploaded } from "@/components/studio/uploader";
import { api, useMe } from "@/lib/api";
import { MODELS, POSES, SCENES } from "@/lib/domain";
import { cn } from "@/lib/utils";

type ModelId = (typeof MODELS)[number]["id"];
type PoseId = (typeof POSES)[number]["id"];
type SceneId = (typeof SCENES)[number]["id"];

export function PhotoshootBuilder() {
  const router = useRouter();
  const { mutate } = useMe();
  const [garment, setGarment] = useState<Uploaded | null>(null);
  const [modelId, setModel] = useState<ModelId>("aanya");
  const [poseId, setPose] = useState<PoseId>("standing");
  const [sceneId, setScene] = useState<SceneId>("palace");
  const [styling, setStyling] = useState("");
  const [count, setCount] = useState(2);
  const [ratio, setRatio] = useState<"3:4" | "1:1" | "9:16">("3:4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!garment) return;
    setBusy(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/api/studio/jobs", { method: "POST", json: { kind: "photoshoot", inputFileId: garment.id, modelId, poseId, sceneId, styling, count, ratio } });
      mutate();
      router.push(`/studio/result/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the photoshoot");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/studio" className="flex items-center gap-1 self-start text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" /> Fashion Studio</Link>
      <h1 className="font-display text-3xl font-bold tracking-tight">Fashion Photoshoot</h1>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Section step={1} title="Your garment" hint="One clear photo works best.">
            <Uploader value={garment} onChange={setGarment} />
          </Section>
        </div>
        <div className="flex flex-col gap-5">
          <Section step={2} title="Model look">
            <ChoiceGrid items={MODELS} value={modelId} onChange={setModel} cols="grid-cols-2 sm:grid-cols-5" render={(m) => (
              <div>
                <span className={cn("grid aspect-square place-items-center rounded-xl bg-gradient-to-br", m.tone as string)}><User className="size-8 text-white" /></span>
                <p className="mt-2 text-sm font-semibold">{m.name as string}</p>
                <p className="text-xs text-muted">{m.desc as string}</p>
              </div>
            )} />
          </Section>
          <Section step={3} title="Choose a pose">
            <ChoiceGrid items={POSES} value={poseId} onChange={setPose} render={(p) => <p className="p-2 text-sm font-semibold">{p.label as string}</p>} />
          </Section>
          <Section step={4} title="Set the scene">
            <ChoiceGrid items={SCENES} value={sceneId} onChange={setScene} render={(s) => (
              <div>
                <span className={cn("block aspect-[16/9] rounded-xl bg-gradient-to-b", s.tone as string)} />
                <p className="mt-2 text-sm font-semibold">{s.label as string}</p>
              </div>
            )} />
          </Section>
          <Section step={5} title="Styling and output" hint="Optional: jewellery, hair, footwear, mood.">
            <textarea value={styling} onChange={(e) => setStyling(e.target.value)} maxLength={300} rows={2} placeholder="Gold jhumkas, hair in a low bun, soft smile" className="w-full rounded-xl border border-line px-3 py-2.5 outline-none focus:ring-4 focus:ring-brand/20" />
            <div className="mt-4 flex flex-wrap gap-6">
              <div>
                <p className="text-sm font-semibold">Photos</p>
                <div className="mt-2 flex gap-2">{[1, 2, 3, 4].map((n) => <Pill key={n} on={count === n} onClick={() => setCount(n)}>{n}</Pill>)}</div>
              </div>
              <div>
                <p className="text-sm font-semibold">Shape</p>
                <div className="mt-2 flex gap-2">{(["3:4", "1:1", "9:16"] as const).map((r) => <Pill key={r} on={ratio === r} onClick={() => setRatio(r)}>{r === "3:4" ? "Portrait 3:4" : r === "1:1" ? "Square" : "Story 9:16"}</Pill>)}</div>
              </div>
            </div>
          </Section>
          <SubmitBar cost={count} disabled={!garment} busy={busy} error={error} onSubmit={submit} label={garment ? "Create photoshoot" : "Upload a garment first"} />
        </div>
      </div>
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", on ? "border-brand bg-mint text-brand" : "border-line hover:bg-paper")}>{children}</button>;
}
