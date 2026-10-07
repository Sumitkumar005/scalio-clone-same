"use client";

import { CalendarDays, Clock, LayoutGrid, Loader2, Tags } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { POST_FORMATS, type CalendarPrefs, type PostFormat } from "@/lib/domain";
import { Card, ChipToggle, Field, inputCls, ListEditor, SaveButton, useSaver } from "./ui";

const DAYS_LABEL: Record<number, string> = { 1: "Wed", 2: "Tue, Fri", 3: "Mon, Wed, Fri", 4: "Mon, Wed, Thu, Sat", 5: "Mon, Wed–Sat", 6: "Mon–Sat", 7: "Every day" };

export function PlannerSettings() {
  const month = new Date().toISOString().slice(0, 7);
  const { data } = useSWR<{ prefs: CalendarPrefs }>(`/api/calendar?month=${month}`, (p: string) => api<{ prefs: CalendarPrefs }>(p));
  if (!data) return <Loader2 className="size-6 animate-spin text-brand" />;
  return <PlannerForm prefs={data.prefs} />;
}

function PlannerForm({ prefs }: { prefs: CalendarPrefs }) {
  const [f, setF] = useState(prefs);
  const s = useSaver();
  const set = (p: Partial<CalendarPrefs>) => { setF({ ...f, ...p }); s.dirty(); };
  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); s.run(() => api("/api/calendar/prefs", { method: "PUT", json: f })); }}>
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight">Posts Planner</h1>
        <p className="mt-2 text-muted">How your content calendar gets planned each month.</p>
      </header>
      <Card icon={<CalendarDays className="size-5" />} title="Rhythm" subtitle="How often you want to post.">
        <Field label={`Posts per week: ${f.postsPerWeek}`} hint={`Posting days: ${DAYS_LABEL[f.postsPerWeek]} (plus festival days)`}>
          <input type="range" min={1} max={7} value={f.postsPerWeek} onChange={(e) => set({ postsPerWeek: Number(e.target.value) })} className="w-full accent-[#22b04b]" />
        </Field>
        <Field label="Default posting time" className="mt-3">
          <label className="flex items-center gap-2"><Clock className="size-4 text-muted" /><input type="time" value={f.postTime} onChange={(e) => set({ postTime: e.target.value })} className={inputCls} /></label>
        </Field>
      </Card>
      <Card icon={<LayoutGrid className="size-5" />} title="Formats" subtitle="We rotate through these across the month.">
        <ChipToggle options={POST_FORMATS} value={f.formats} onChange={(v) => set({ formats: v as PostFormat[] })} />
      </Card>
      <Card icon={<Tags className="size-5" />} title="Themes" subtitle="Topics we cycle through. Festival posts are added automatically.">
        <ListEditor value={f.themes} onChange={(v) => set({ themes: v })} placeholder="e.g. Student success stories" max={10} collapseAt={10} />
      </Card>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="mr-auto text-sm text-muted">New settings apply to empty days. <Link href="/calendar" className="font-semibold text-brand">Open Calendar</Link> and press “Check for updates”.</p>
        {s.error && <p className="text-sm text-red-600">{s.error}</p>}
        <SaveButton state={s.state} disabled={!f.formats.length || !f.themes.length} />
      </div>
    </form>
  );
}
