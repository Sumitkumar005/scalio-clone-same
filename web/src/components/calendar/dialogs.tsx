"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { POST_FORMATS, type CalendarPrefs, type PostFormat } from "@/lib/domain";
import { cn } from "@/lib/utils";
import type { PostDTO } from "./types";

const input = "w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:ring-4 focus:ring-brand/20";

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-mint"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function NewPostDialog({ date, onClose, onCreated }: { date: string; onClose: () => void; onCreated: (p: PostDTO) => void }) {
  const [f, setF] = useState({ date, title: "", subtitle: "", caption: "", format: "post" as PostFormat });
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Create a post" onClose={onClose}>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { post } = await api<{ post: PostDTO }>("/api/calendar/posts", { method: "POST", json: f });
          onCreated(post);
        }}
      >
        <label className="text-sm font-semibold">Headline<input required autoFocus maxLength={80} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} placeholder="Weekend offer is live" /></label>
        <label className="text-sm font-semibold">Supporting line<input maxLength={140} value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} className={input} /></label>
        <label className="text-sm font-semibold">Caption<textarea rows={3} value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} className={input} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Date<input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={input} /></label>
          <label className="text-sm font-semibold">Format
            <select value={f.format} onChange={(e) => setF({ ...f, format: e.target.value as PostFormat })} className={input}>
              {POST_FORMATS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <button disabled={busy || !f.title.trim()} className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-bright font-semibold text-white disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />} Add to calendar
        </button>
      </form>
    </Modal>
  );
}

export function CustomizeDialog({ prefs, onClose, onSaved }: { prefs: CalendarPrefs; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ ...prefs, themesText: prefs.themes.join(", ") });
  const [busy, setBusy] = useState(false);
  const toggle = (x: PostFormat) => setF({ ...f, formats: f.formats.includes(x) ? f.formats.filter((y) => y !== x) : [...f.formats, x] });
  return (
    <Modal title="Customize your plan" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await api("/api/calendar/prefs", {
            method: "PUT",
            json: { postsPerWeek: f.postsPerWeek, formats: f.formats, postTime: f.postTime, themes: f.themesText.split(",").map((t) => t.trim()).filter(Boolean) },
          });
          onSaved();
        }}
      >
        <label className="text-sm font-semibold">
          Posts per week: {f.postsPerWeek}
          <input type="range" min={1} max={7} value={f.postsPerWeek} onChange={(e) => setF({ ...f, postsPerWeek: Number(e.target.value) })} className="mt-2 w-full accent-[#22b04b]" />
        </label>
        <div className="text-sm font-semibold">
          Formats
          <div className="mt-2 flex flex-wrap gap-2">
            {POST_FORMATS.map((x) => (
              <button type="button" key={x} onClick={() => toggle(x)} className={cn("rounded-full border px-3 py-1.5 capitalize", f.formats.includes(x) ? "border-brand bg-mint text-brand" : "border-line")}>{x}</button>
            ))}
          </div>
        </div>
        <label className="text-sm font-semibold">Themes (comma separated)<input value={f.themesText} onChange={(e) => setF({ ...f, themesText: e.target.value })} className={input} /></label>
        <label className="text-sm font-semibold">Default posting time<input type="time" value={f.postTime} onChange={(e) => setF({ ...f, postTime: e.target.value })} className={input} /></label>
        <p className="text-xs text-muted">Changes apply to new days when you press “Check for updates”. Existing posts stay as they are.</p>
        <button disabled={busy || !f.formats.length} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-bright font-semibold text-white disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />} Save
        </button>
      </form>
    </Modal>
  );
}
