"use client";

import { CalendarCheck, Check, Download, Loader2, Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { POST_FORMATS, type PostStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { imageUrl, STATUS_META, type PostDTO } from "./types";

const input = "w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:ring-4 focus:ring-brand/20";

export function PostEditor({ post, brandColor, onClose, onChanged }: { post: PostDTO; brandColor?: string; onClose: () => void; onChanged: (p: PostDTO | null) => void }) {
  const [f, setF] = useState({
    title: post.title,
    subtitle: post.subtitle ?? "",
    caption: post.caption,
    hashtags: post.hashtags.join(" "),
    date: post.date,
    time: post.time ?? "19:00",
    format: post.format,
    palette: post.palette,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const save = async (status?: PostStatus) => {
    setBusy(status ?? "save");
    const { post: updated } = await api<{ post: PostDTO }>(`/api/calendar/posts/${post._id}`, {
      method: "PATCH",
      json: { ...f, hashtags: f.hashtags.split(/\s+/).filter(Boolean).map((h) => (h.startsWith("#") ? h : `#${h}`)), ...(status && { status }) },
    });
    setBusy(null);
    onChanged(updated);
  };

  const remove = async () => {
    if (!confirm("Delete this post?")) return;
    setBusy("delete");
    await api(`/api/calendar/posts/${post._id}`, { method: "DELETE" });
    onChanged(null);
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(`${f.caption}\n\n${f.hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-white px-5 py-4">
          <span className={cn("size-2.5 rounded-full", STATUS_META[post.status].dot)} />
          <span className="text-sm font-semibold">{STATUS_META[post.status].label}</span>
          <span className="text-sm text-muted">· {post.theme}{post.festival ? ` · ${post.festival}` : ""}</span>
          <button aria-label="Close" onClick={onClose} className="ml-auto grid size-9 place-items-center rounded-full hover:bg-mint"><X className="size-5" /></button>
        </header>
        <div className="grid gap-6 p-5 md:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(post)} alt={post.title} className="w-full rounded-2xl border border-line" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <button
                  key={i}
                  aria-label={i === 0 && brandColor ? "Brand style" : `Style ${i + 1}`}
                  title={i === 0 && brandColor ? "Your brand colour" : undefined}
                  onClick={() => setF({ ...f, palette: i })}
                  style={i === 0 && brandColor ? { background: brandColor } : undefined}
                  className={cn("size-8 rounded-full border-2", f.palette === i ? "border-ink" : "border-transparent", ["bg-[#0b5ed7]", "bg-[#1d7539]", "bg-[#ff6525]", "bg-[#6d28d9]", "bg-[#fcd34d]", "bg-[#7dd3fc]"][i])}
                />
              ))}
            </div>
            <p className="text-xs text-muted">Pick a style, then Save to update the image.{brandColor ? " The first one is your brand colour." : " Add a brand colour in Settings to get a Brand style."}</p>
            <a href={imageUrl(post)} download={`${post.date}-${post.title}.svg`} className="flex items-center justify-center gap-2 rounded-xl border border-line py-2 text-sm font-semibold hover:bg-mint">
              <Download className="size-4" /> Download image
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold">Headline<input value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} className={input} /></label>
            <label className="text-sm font-semibold">Supporting line<input value={f.subtitle} maxLength={140} onChange={(e) => setF({ ...f, subtitle: e.target.value })} className={input} /></label>
            <label className="text-sm font-semibold">Caption<textarea rows={5} value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} className={input} /></label>
            <label className="text-sm font-semibold">Hashtags<input value={f.hashtags} onChange={(e) => setF({ ...f, hashtags: e.target.value })} className={input} /></label>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-sm font-semibold">Date<input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={input} /></label>
              <label className="text-sm font-semibold">Time<input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} className={input} /></label>
              <label className="text-sm font-semibold">Format
                <select value={f.format} onChange={(e) => setF({ ...f, format: e.target.value as PostDTO["format"] })} className={input}>
                  {POST_FORMATS.map((x) => <option key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</option>)}
                </select>
              </label>
            </div>
            <button onClick={copyCaption} className="self-start text-sm font-semibold text-brand">{copied ? "Copied ✓" : "Copy caption + hashtags"}</button>
          </div>
        </div>
        <footer className="sticky bottom-0 mt-auto flex flex-wrap items-center gap-2 border-t border-line bg-white px-5 py-4">
          <button onClick={remove} disabled={!!busy} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-4" /> Delete</button>
          <div className="ml-auto flex flex-wrap gap-2">
            <Btn onClick={() => save()} busy={busy === "save"}>Save</Btn>
            {post.status !== "ready" && <Btn onClick={() => save("ready")} busy={busy === "ready"} icon={<Check className="size-4" />}>Mark ready</Btn>}
            <Btn onClick={() => save("scheduled")} busy={busy === "scheduled"} icon={<CalendarCheck className="size-4" />}>Schedule</Btn>
            <Btn primary onClick={() => save("published")} busy={busy === "published"} icon={<Send className="size-4" />}>Mark published</Btn>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Btn({ children, onClick, busy, icon, primary }: { children: React.ReactNode; onClick: () => void; busy?: boolean; icon?: React.ReactNode; primary?: boolean }) {
  return (
    <button onClick={onClick} disabled={busy} className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60", primary ? "bg-brand-bright text-white hover:bg-brand" : "border border-line hover:bg-mint")}>
      {busy ? <Loader2 className="size-4 animate-spin" /> : icon} {children}
    </button>
  );
}
