"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clapperboard, Filter, List, Loader2, PlusCircle, RefreshCw, Settings, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { POST_FORMATS, type PostFormat } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { CustomizeDialog, NewPostDialog } from "./dialogs";
import { PostEditor } from "./post-editor";
import { imageUrl, isoDate, monthGrid, STATUS_META, type CalendarResponse, type PostDTO } from "./types";

type View = "month" | "week" | "list";
type StatusFilter = "all" | "ready" | "draft" | "needs_attention";
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function CalendarView() {
  const router = useRouter();
  const params = useSearchParams();
  const todayIso = isoDate(new Date());
  const anchor = params.get("date") ?? todayIso;
  const [year, month] = anchor.split("-").map(Number);
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const [view, setView] = useState<View>("month");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [format, setFormat] = useState<PostFormat | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [editing, setEditing] = useState<PostDTO | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [planning, setPlanning] = useState(false);

  const { data, mutate, isLoading, isValidating } = useSWR<CalendarResponse>(`/api/calendar?month=${monthKey}`, (p: string) => api<CalendarResponse>(p));

  const go = (iso: string) => router.replace(`/calendar?date=${iso}`, { scroll: false });
  const shiftMonth = (delta: number) => go(isoDate(new Date(year, month - 1 + delta, 1)));
  const shiftWeek = (delta: number) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + delta * 7);
    go(isoDate(d));
  };

  const plan = async () => {
    setPlanning(true);
    try {
      await api("/api/calendar/generate", { method: "POST", json: { month: monthKey } });
      await mutate();
    } finally {
      setPlanning(false);
    }
  };

  // First visit to an empty current/future month: plan it automatically.
  const autoPlanned = useRef(new Set<string>());
  useEffect(() => {
    if (!data || data.counts.all > 0 || monthKey < todayIso.slice(0, 7) || autoPlanned.current.has(monthKey)) return;
    autoPlanned.current.add(monthKey);
    plan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, monthKey]);

  // Deep link from Library: /calendar?post=<id>
  const postParam = params.get("post");
  const linked = postParam ? data?.posts.find((x) => x._id === postParam) ?? null : null;
  const open = editing ?? linked;

  const visible = useMemo(() => {
    const list = data?.posts ?? [];
    return list.filter(
      (p) =>
        (format === "all" || p.format === format) &&
        (status === "all" || (status === "ready" ? p.status === "ready" || p.status === "scheduled" : p.status === status)),
    );
  }, [data, status, format]);

  const byDate = useMemo(() => {
    const m = new Map<string, PostDTO[]>();
    for (const p of visible) m.set(p.date, [...(m.get(p.date) ?? []), p]);
    return m;
  }, [visible]);
  const festivals = useMemo(() => new Map((data?.festivals ?? []).map((f) => [f.date, f.name])), [data]);

  const onChanged = (p: PostDTO | null) => {
    setEditing(null);
    if (postParam) router.replace(`/calendar?date=${anchor}`, { scroll: false });
    mutate();
    void p;
  };

  const name = data?.business?.name || "Your";
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-IN", { month: "long", year: year === new Date().getFullYear() ? undefined : "numeric" });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand font-display text-2xl font-extrabold text-white shadow">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand"><span className="size-1.5 rounded-full bg-brand-bright" /> Content calendar</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">{name === "Your" ? "Your plan" : `${name}'s plan`}</h1>
          <p className="text-muted">See the month at a glance, then open any post to edit, schedule or publish.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolBtn onClick={() => setCustomizing(true)} icon={<SlidersHorizontal className="size-4" />}>Customize</ToolBtn>
          <ToolBtn href="/director" icon={<Clapperboard className="size-4" />}>Reels</ToolBtn>
          <ToolBtn href="/settings" icon={<Settings className="size-4" />}>Settings</ToolBtn>
          <button onClick={() => setCreating(anchor < todayIso ? todayIso : anchor)} className="flex items-center gap-2 rounded-xl bg-brand-bright px-4 py-2.5 font-semibold text-white shadow hover:bg-brand">
            <PlusCircle className="size-5" /> Create
          </button>
        </div>
      </header>

      <button onClick={plan} disabled={planning} className="flex items-center gap-2 self-start font-semibold text-brand disabled:opacity-60">
        {planning ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        {planning ? "Planning your month…" : "Check for updates"} <ChevronRight className="size-4" />
      </button>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-2">
        <NavBtn onClick={() => (view === "week" ? shiftWeek(-1) : shiftMonth(-1))} label="Previous"><ChevronLeft className="size-5" /></NavBtn>
        <span className="min-w-36 text-center font-display text-xl font-bold capitalize">{monthName}</span>
        <NavBtn onClick={() => (view === "week" ? shiftWeek(1) : shiftMonth(1))} label="Next"><ChevronRight className="size-5" /></NavBtn>
        <button onClick={() => go(todayIso)} className="rounded-xl border border-line px-3 py-2 font-semibold hover:bg-mint">Today</button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line p-1">
            {([["month", CalendarDays, "Month"], ["week", SlidersHorizontal, "Week"], ["list", List, "List"]] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setView(v)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold", view === v ? "bg-mint text-brand" : "text-ink/70 hover:bg-paper")}>
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setFilterOpen((o) => !o)} className={cn("flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-semibold hover:bg-mint", format !== "all" && "border-brand text-brand")}>
              <Filter className="size-4" /> {format === "all" ? "Filter" : format}
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-line bg-white p-1.5 shadow-xl">
                {(["all", ...POST_FORMATS] as const).map((x) => (
                  <button key={x} onClick={() => { setFormat(x); setFilterOpen(false); }} className={cn("block w-full rounded-xl px-3 py-2 text-left text-sm capitalize hover:bg-mint", format === x && "font-semibold text-brand")}>
                    {x === "all" ? "All formats" : x}
                  </button>
                ))}
              </div>
            )}
          </div>
          <NavBtn onClick={() => mutate()} label="Refresh"><RefreshCw className={cn("size-4", isValidating && "animate-spin")} /></NavBtn>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([["all", "All posts", data?.counts.all], ["ready", "Ready", data?.counts.ready], ["draft", "Drafts", data?.counts.draft], ["needs_attention", "Needs attention", data?.counts.needs_attention]] as const).map(([k, label, n]) => (
          <button key={k} onClick={() => setStatus(k)} className={cn("flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold", status === k ? "border-brand bg-white text-brand" : "border-line bg-white text-ink/80 hover:bg-mint")}>
            {label} {k !== "all" && n ? <span className="rounded-full bg-paper px-2 text-xs text-muted">{n}</span> : null}
          </button>
        ))}
      </div>

      {isLoading || !data ? (
        <div className="grid h-96 place-items-center rounded-2xl border border-line bg-white"><Loader2 className="size-6 animate-spin text-brand" /></div>
      ) : view === "list" ? (
        <ListView posts={visible.filter((p) => p.date.startsWith(monthKey))} festivals={festivals} onOpen={setEditing} />
      ) : (
        <GridView
          days={view === "month" ? monthGrid(year, month) : weekOf(anchor)}
          month={month}
          todayIso={todayIso}
          byDate={byDate}
          festivals={festivals}
          tall={view === "week"}
          onOpen={setEditing}
          onAdd={(iso) => setCreating(iso)}
        />
      )}

      {planning && !data?.counts.all && (
        <p className="flex items-center gap-2 text-sm text-brand"><Sparkles className="size-4" /> Writing posts around your business and this month&apos;s festivals…</p>
      )}

      {open && <PostEditor key={open._id} post={open} brandColor={data?.business?.brandColor} onClose={() => onChanged(open)} onChanged={onChanged} />}
      {creating && <NewPostDialog date={creating} onClose={() => setCreating(null)} onCreated={(p) => { setCreating(null); mutate(); setEditing(p); }} />}
      {customizing && data && <CustomizeDialog prefs={data.prefs} onClose={() => setCustomizing(false)} onSaved={() => { setCustomizing(false); mutate(); }} />}
    </div>
  );
}

function weekOf(iso: string) {
  const d = new Date(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

function GridView({ days, month, todayIso, byDate, festivals, tall, onOpen, onAdd }: {
  days: Date[]; month: number; todayIso: string; byDate: Map<string, PostDTO[]>; festivals: Map<string, string>; tall: boolean; onOpen: (p: PostDTO) => void; onAdd: (iso: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <div className="grid min-w-[860px] grid-cols-7">
        {WEEKDAYS.map((d) => <div key={d} className="border-b border-line py-3 text-center text-sm font-semibold">{d}</div>)}
        {days.map((d) => {
          const iso = isoDate(d);
          const inMonth = d.getMonth() + 1 === month;
          const posts = byDate.get(iso) ?? [];
          const fest = festivals.get(iso);
          const past = iso < todayIso;
          return (
            <div key={iso} className={cn("group relative flex flex-col gap-2 border-b border-r border-line p-2", tall ? "min-h-[420px]" : "min-h-40", !inMonth && "bg-paper/60")}>
              <div className="flex items-center justify-between">
                <span className={cn("grid size-8 place-items-center rounded-full text-sm font-semibold", iso === todayIso ? "bg-brand text-white" : inMonth ? "text-ink" : "text-muted")}>{d.getDate()}</span>
                {fest && <span className="truncate rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">✨ {fest}</span>}
              </div>
              {posts.map((p) => <PostCard key={p._id} post={p} onOpen={onOpen} />)}
              {!posts.length && !past && (
                <button onClick={() => onAdd(iso)} aria-label={`Add post on ${iso}`} className="m-auto hidden size-8 place-items-center rounded-full border border-dashed border-line text-muted hover:border-brand hover:text-brand group-hover:grid">+</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostCard({ post, onOpen }: { post: PostDTO; onOpen: (p: PostDTO) => void }) {
  const meta = STATUS_META[post.status];
  return (
    <button onClick={() => onOpen(post)} className={cn("overflow-hidden rounded-xl border border-line bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", meta.ring)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl(post)} alt={post.title} loading="lazy" className="aspect-[4/3] w-full object-cover object-[center_42%]" />
      <span className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold">
        <span className={cn("size-1.5 rounded-full", meta.dot)} /> {meta.label}
        {post.format !== "post" && <span className="ml-auto capitalize text-muted">{post.format}</span>}
      </span>
    </button>
  );
}

function ListView({ posts, festivals, onOpen }: { posts: PostDTO[]; festivals: Map<string, string>; onOpen: (p: PostDTO) => void }) {
  if (!posts.length) return <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">No posts match these filters.</p>;
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {posts.map((p) => (
        <button key={p._id} onClick={() => onOpen(p)} className="flex w-full items-center gap-4 p-3 text-left hover:bg-mint/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl(p)} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover object-top" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">
              {new Date(p.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {p.time} · <span className="capitalize">{p.format}</span>
              {festivals.get(p.date) && <span className="ml-2 rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-700">{festivals.get(p.date)}</span>}
            </p>
            <p className="truncate font-semibold">{p.title}</p>
            <p className="truncate text-sm text-muted">{p.caption.split("\n")[0]}</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm font-semibold"><span className={cn("size-2 rounded-full", STATUS_META[p.status].dot)} />{STATUS_META[p.status].label}</span>
        </button>
      ))}
    </div>
  );
}

function ToolBtn({ children, icon, onClick, href }: { children: React.ReactNode; icon: React.ReactNode; onClick?: () => void; href?: string }) {
  const cls = "flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 font-semibold hover:bg-mint";
  return href ? <Link href={href} className={cls}>{icon}{children}</Link> : <button onClick={onClick} className={cls}>{icon}{children}</button>;
}

function NavBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return <button aria-label={label} onClick={onClick} className="grid size-10 place-items-center rounded-xl border border-line hover:bg-mint">{children}</button>;
}
