"use client";

import { CalendarPlus, Check, Clapperboard, Copy, Music, User, UserX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ReelPlan } from "@/lib/domain";

export function ReelPlanCard({ plan }: { plan: ReelPlan }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const text = [
      plan.title,
      `Hook: ${plan.hook}`,
      ...plan.scenes.map((s) => `${s.n}. [${s.seconds}s] ${s.shot}\n   Text: ${s.onScreenText}\n   VO: ${s.voiceover}`),
      `Caption:\n${plan.caption}\n${plan.hashtags.join(" ")}`,
      `Music: ${plan.music}`,
    ].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="overflow-hidden rounded-3xl border border-brand/30 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-mint/60 px-5 py-4">
        <Clapperboard className="size-5 text-brand" />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Reel plan · ready to shoot</p>
          <h3 className="font-display text-lg font-bold">{plan.title}</h3>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold">
          {plan.durationSec}s · {plan.presenter ? <User className="size-3.5" /> : <UserX className="size-3.5" />} {plan.presenter ? "Presenter" : "No presenter"}
        </span>
      </div>
      <div className="p-5">
        <p className="text-sm text-muted">Hook</p>
        <p className="text-lg font-semibold">“{plan.hook}”</p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {plan.scenes.map((s) => (
            <li key={s.n} className="rounded-2xl border border-line p-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted">
                <span>Scene {s.n}</span>
                <span>{s.seconds}s</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{s.shot}</p>
              <p className="mt-1 rounded-lg bg-ink px-2 py-1 text-xs font-bold text-white">{s.onScreenText}</p>
              <p className="mt-1 text-sm text-muted">🎙 {s.voiceover}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-2xl bg-paper p-4">
          <p className="text-sm text-muted">Caption</p>
          <p className="whitespace-pre-wrap text-sm">{plan.caption}</p>
          <p className="mt-2 text-sm text-brand">{plan.hashtags.join(" ")}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Music className="size-3.5" /> {plan.music}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={copy} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-mint">
            {copied ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy script"}
          </button>
          <Link href="/calendar" className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-mint">
            <CalendarPlus className="size-4" /> Plan it in Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
