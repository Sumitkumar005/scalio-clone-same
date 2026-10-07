"use client";

import { Check, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api, useMe, type BusinessDTO } from "@/lib/api";
import { CATEGORIES } from "@/lib/domain";

const input = "h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:ring-4 focus:ring-brand/20";

export function SettingsForm() {
  const { data: me, mutate } = useMe();
  if (!me) return <Loader2 className="size-6 animate-spin text-brand" />;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {me.business && <ProfileForm b={me.business} onSaved={(business) => mutate({ ...me, business }, { revalidate: false })} />}
      <aside className="flex flex-col gap-4">
        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold">Account</h2>
          {me.user.isGuest ? (
            <>
              <p className="mt-1 text-sm text-muted">You&apos;re on a guest account. Sign in so your work is safe on any device.</p>
              <Link href="/login" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-white"><LogIn className="size-4" /> Sign in</Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">Signed in as {me.user.email}</p>
          )}
        </div>
        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-display text-lg font-bold">AI status</h2>
          <p className="mt-1 text-sm text-muted">
            {me.ai ? "Connected. Ideas and chat use live AI." : "Not connected. Ideas use built-in templates until you add DEEPSEEK_API_KEY."}
          </p>
        </div>
      </aside>
    </div>
  );
}

function ProfileForm({ b, onSaved }: { b: BusinessDTO; onSaved: (b: BusinessDTO) => void }) {
  const [f, setF] = useState({
    name: b.name,
    category: b.category ?? "",
    website: b.website ?? "",
    instagram: b.instagram ?? "",
    description: b.description ?? "",
    offerings: b.offerings.join(", "),
    audience: b.audience ?? "",
    city: b.city ?? "",
    tone: b.tone ?? "",
  });
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF({ ...f, [k]: e.target.value });
    setState("idle");
  };
  return (
    <form
      className="grid gap-4 rounded-3xl border border-line bg-white p-6 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        const { business } = await api<{ business: BusinessDTO }>("/api/business", {
          method: "PATCH",
          json: { ...f, category: f.category || undefined, offerings: f.offerings.split(",").map((s) => s.trim()).filter(Boolean) },
        });
        onSaved(business);
        setState("saved");
      }}
    >
      <h2 className="font-display text-lg font-bold sm:col-span-2">Business profile</h2>
      <L label="Business name"><input required value={f.name} onChange={set("name")} className={input} /></L>
      <L label="Category">
        <select value={f.category} onChange={set("category")} className={input}>
          <option value="">Choose one</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </L>
      <L label="Website"><input value={f.website} onChange={set("website")} className={input} /></L>
      <L label="Instagram"><input value={f.instagram} onChange={set("instagram")} className={input} placeholder="yourbrand" /></L>
      <L label="What you sell (comma separated)" wide><input value={f.offerings} onChange={set("offerings")} className={input} /></L>
      <L label="One line about you" wide><textarea rows={2} value={f.description} onChange={set("description")} className={`${input} h-auto py-3`} /></L>
      <L label="Who buys from you"><input value={f.audience} onChange={set("audience")} className={input} /></L>
      <L label="City"><input value={f.city} onChange={set("city")} className={input} /></L>
      <L label="Brand voice"><input value={f.tone} onChange={set("tone")} className={input} placeholder="Warm, expert, simple" /></L>
      <div className="flex items-end sm:col-span-2">
        <button disabled={state === "saving"} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-6 font-semibold text-white disabled:opacity-60">
          {state === "saving" ? <Loader2 className="size-4 animate-spin" /> : state === "saved" ? <Check className="size-4" /> : null}
          {state === "saved" ? "Saved" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function L({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
