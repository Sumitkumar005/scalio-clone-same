"use client";

import { Check, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const inputCls = "w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:ring-4 focus:ring-brand/20";

export function Card({ icon, title, subtitle, action, children, className }: { icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6", className)}>
      <header className="mb-5 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-paper text-brand">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line p-4", className)}>
      <p className="font-semibold">{label}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function SaveButton({ state, onClick, disabled, label = "Save" }: { state: "idle" | "saving" | "saved" | "error"; onClick?: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || state === "saving"}
      className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
    >
      {state === "saving" ? <Loader2 className="size-4 animate-spin" /> : state === "saved" ? <Check className="size-4" /> : null}
      {state === "saved" ? "Saved" : label}
    </button>
  );
}

/** Toggle chips (multi-select). */
export function ChipToggle({ options, value, onChange }: { options: readonly string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold transition", on ? "border-brand bg-mint text-brand" : "border-line text-ink/80 hover:border-brand/40")}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Editable list of short strings with "+N more" collapse. */
export function ListEditor({ value, onChange, placeholder, max = 12, collapseAt = 3 }: { value: string[]; onChange: (v: string[]) => void; placeholder: string; max?: number; collapseAt?: number }) {
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? value : value.slice(0, collapseAt);
  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v) || value.length >= max) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-2">
      {shown.map((item, i) => (
        <div key={item} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
          <span className="flex-1 text-sm">{item}</span>
          <button type="button" aria-label={`Remove ${item}`} onClick={() => onChange(value.filter((_, j) => j !== (expanded ? i : value.indexOf(item))))} className="text-muted hover:text-red-600">
            <X className="size-4" />
          </button>
        </div>
      ))}
      {value.length > collapseAt && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="self-start text-sm font-semibold text-brand">
          {expanded ? "Show less" : `+${value.length - collapseAt} more`}
        </button>
      )}
      {value.length < max && (
        <div className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={placeholder} className={inputCls} />
          <button type="button" onClick={add} aria-label="Add" className="grid size-11 shrink-0 place-items-center rounded-xl border border-line hover:bg-mint"><Plus className="size-4" /></button>
        </div>
      )}
    </div>
  );
}

export function useSaver() {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => Promise<unknown>) => {
    setState("saving");
    setError(null);
    try {
      await fn();
      setState("saved");
      setTimeout(() => setState("idle"), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save");
      setState("error");
    }
  };
  return { state, error, run, dirty: () => setState("idle") };
}
