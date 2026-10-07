"use client";

import { Check, Coins, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { api, useMe } from "@/lib/api";
import { cn } from "@/lib/utils";

type Billing = {
  balance: number;
  plan: string;
  plans: { id: string; name: string; priceInr: number; credits: number; features: string[] }[];
  paymentsEnabled: boolean;
  devTopup: boolean;
  ledger: { id: string; delta: number; label: string; createdAt: string }[];
};

export function BillingSettings() {
  const { data, mutate } = useSWR<Billing>("/api/billing", (p: string) => api<Billing>(p));
  const { mutate: refreshMe } = useMe();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  if (!data) return <Loader2 className="size-6 animate-spin text-brand" />;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-muted">Your plan, credits and how they were used.</p>
      </header>

      <section className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-gradient-to-r from-mint to-white p-6">
        <span className="grid size-14 place-items-center rounded-2xl bg-white text-brand shadow-sm"><Coins className="size-7" /></span>
        <div className="flex-1">
          <p className="text-sm text-muted">Credits left</p>
          <p className="font-display text-4xl font-bold">{data.balance}</p>
        </div>
        <p className="text-sm text-muted">1 credit = 1 studio photo. Calendar, ideas and director plans are free.</p>
        {data.devTopup && (
          <button
            onClick={async () => { setBusy(true); await api("/api/billing", { method: "POST" }); await mutate(); await refreshMe(); setBusy(false); }}
            className="flex items-center gap-2 rounded-xl border border-dashed border-brand px-4 py-2 text-sm font-semibold text-brand"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add 50 test credits (dev)
          </button>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.plans.map((p) => {
          const current = p.id === data.plan;
          return (
            <div key={p.id} className={cn("flex flex-col rounded-3xl border p-6", current ? "border-brand bg-mint/40" : "border-line bg-white", p.id === "starter" && !current && "shadow-lg")}>
              <p className="font-display text-xl font-bold">{p.name}</p>
              <p className="mt-2"><span className="font-display text-3xl font-bold">₹{p.priceInr.toLocaleString("en-IN")}</span>{p.priceInr > 0 && <span className="text-muted"> /month</span>}</p>
              <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}</li>)}
              </ul>
              <button
                disabled={current}
                onClick={() => setNote(data.paymentsEnabled ? null : "Online payments open soon. Write to support and we'll upgrade you manually.")}
                className={cn("mt-6 h-11 rounded-xl font-semibold", current ? "bg-white text-brand" : "bg-brand-bright text-white hover:bg-brand")}
              >
                {current ? "Current plan" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </section>
      {note && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{note}</p>}

      <section className="rounded-3xl border border-line bg-white">
        <h2 className="border-b border-line px-6 py-4 font-display text-lg font-bold">Credit history</h2>
        {data.ledger.length ? (
          <ul className="divide-y divide-line">
            {data.ledger.map((l) => (
              <li key={l.id} className="flex items-center gap-4 px-6 py-3 text-sm">
                <span className="flex-1">{l.label}</span>
                <span className="text-muted">{new Date(l.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                <span className={cn("w-14 text-right font-semibold", l.delta > 0 ? "text-brand" : "text-ink")}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-6 text-sm text-muted">No credit activity yet.</p>
        )}
      </section>
    </div>
  );
}
