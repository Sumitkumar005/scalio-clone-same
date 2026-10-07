"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-brand">Step {step}</p>
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ChoiceGrid<T extends string>({ items, value, onChange, render, cols = "grid-cols-2 sm:grid-cols-3" }: {
  items: readonly { id: T }[]; value: T | T[]; onChange: (id: T) => void; render: (item: { id: T } & Record<string, unknown>) => React.ReactNode; cols?: string;
}) {
  const isOn = (id: T) => (Array.isArray(value) ? value.includes(id) : value === id);
  return (
    <div className={cn("grid gap-3", cols)}>
      {items.map((it) => (
        <button
          type="button"
          key={it.id}
          onClick={() => onChange(it.id)}
          className={cn("relative rounded-2xl border p-2 text-left transition", isOn(it.id) ? "border-brand ring-2 ring-brand/30" : "border-line hover:border-brand/40")}
        >
          {render(it as { id: T } & Record<string, unknown>)}
          {isOn(it.id) && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-white"><Check className="size-4" /></span>}
        </button>
      ))}
    </div>
  );
}
