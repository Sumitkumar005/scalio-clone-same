"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Lightbulb, Loader2, PanelLeftClose, PanelLeftOpen, Plus, Search, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { DIRECTOR_NAME } from "@/config/nav";
import { api } from "@/lib/api";
import { REEL_GOALS, type ReelPlan } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { DirectorAvatar } from "./avatar";
import { ReelPlanCard } from "./reel-plan-card";

type ThreadSummary = { _id: string; title: string; status: "drafting" | "ready"; updatedAt: string };
type ThreadFull = ThreadSummary & { messages: UIMessage[]; plan?: ReelPlan };
type ListResponse = { threads: ThreadSummary[]; usage: { used: number; limit: number; left: number; pct: number } };

export function DirectorWorkspace() {
  const router = useRouter();
  const params = useSearchParams();
  const threadId = params.get("thread");
  const ideaId = params.get("idea");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pending, setPending] = useState<{ id: string; prompt: string } | null>(null);
  const list = useSWR<ListResponse>(`/api/director/threads${q ? `?q=${encodeURIComponent(q)}` : ""}`, (p: string) => api<ListResponse>(p));

  const start = async (prompt: string, fromIdea?: string) => {
    const { thread } = await api<{ thread: { _id: string } }>("/api/director/threads", { method: "POST", json: { ideaId: fromIdea } });
    setPending({ id: thread._id, prompt });
    router.replace(`/director?thread=${thread._id}`);
    list.mutate();
  };

  // Arriving from an idea card: open a reel seeded with that idea.
  const seeded = useRef(false);
  useEffect(() => {
    if (!ideaId || seeded.current) return;
    seeded.current = true;
    api<{ ideas: { _id: string; title: string; hook: string }[] }>("/api/ideas?limit=100").then(({ ideas }) => {
      const idea = ideas.find((i) => i._id === ideaId);
      start(idea ? `Make a reel for this idea: "${idea.title}". Hook: ${idea.hook}` : "Get more customers", ideaId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  return (
    <div className="-mx-4 -mt-6 flex h-[calc(100dvh-4rem)] md:-mx-8 md:h-[calc(100dvh-5rem)]">
      <aside className={cn("hidden shrink-0 flex-col border-r border-line bg-paper transition-all md:flex", collapsed ? "w-16" : "w-72")}>
        <div className="flex items-start justify-between p-4">
          {!collapsed && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Video agent</p>
              <p className="font-display text-xl font-bold">Your videos</p>
            </div>
          )}
          <button aria-label="Toggle sidebar" onClick={() => setCollapsed((c) => !c)} className="grid size-9 place-items-center rounded-xl hover:bg-mint">
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        </div>
        <div className="flex flex-col gap-1 px-3">
          <button onClick={() => router.push("/director")} className="flex items-center gap-3 rounded-xl bg-brand-bright px-3 py-3 font-semibold text-white hover:bg-brand">
            <SquarePen className="size-5" /> {!collapsed && "New reel"}
          </button>
          {searching && !collapsed ? (
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => !q && setSearching(false)} placeholder="Search reels" className="h-11 rounded-xl border border-line bg-white px-3 outline-none" />
          ) : (
            <button onClick={() => { setCollapsed(false); setSearching(true); }} className="flex items-center gap-3 rounded-xl px-3 py-3 text-ink hover:bg-mint">
              <Search className="size-5" /> {!collapsed && "Search"}
            </button>
          )}
          <Link href="/ideas" className="flex items-center gap-3 rounded-xl px-3 py-3 text-ink hover:bg-mint">
            <Lightbulb className="size-5" /> {!collapsed && "Ideas"}
          </Link>
        </div>
        {!collapsed && <ThreadList threads={list.data?.threads} activeId={threadId} onDeleted={() => list.mutate()} />}
        {!collapsed && list.data && (
          <div className="m-3 mt-auto rounded-2xl border border-line bg-white p-3">
            <div className="flex justify-between text-sm"><span className="font-semibold">{DIRECTOR_NAME} usage</span><span className="text-brand">{Math.round(list.data.usage.pct)}%</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand-bright" style={{ width: `${Math.max(2, list.data.usage.pct)}%` }} /></div>
            <p className="mt-2 text-xs text-muted">{list.data.usage.left.toLocaleString("en-IN")} tokens left this week</p>
          </div>
        )}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-mint to-white px-5 py-3">
          <DirectorAvatar size={44} />
          <div>
            <p className="font-semibold">{DIRECTOR_NAME}</p>
            <p className="text-sm text-muted">Your video director</p>
          </div>
          <Link href="/director" className="ml-auto rounded-xl border border-line px-3 py-1.5 text-sm font-semibold md:hidden">New reel</Link>
        </header>
        {threadId ? (
          <ThreadChat key={threadId} threadId={threadId} initialPrompt={pending?.id === threadId ? pending.prompt : undefined} onUpdate={() => list.mutate()} />
        ) : (
          <EmptyState onPick={(g) => start(g)} />
        )}
      </section>
    </div>
  );
}

function ThreadList({ threads, activeId, onDeleted }: { threads?: ThreadSummary[]; activeId: string | null; onDeleted: () => void }) {
  const router = useRouter();
  if (!threads) return <div className="p-4"><Loader2 className="size-4 animate-spin text-muted" /></div>;
  if (!threads.length) return <p className="px-4 pt-6 text-sm text-muted">Your reels will show up here.</p>;
  const groups = new Map<string, ThreadSummary[]>();
  for (const t of threads) {
    const label = dayLabel(t.updatedAt);
    groups.set(label, [...(groups.get(label) ?? []), t]);
  }
  return (
    <div className="mt-4 flex-1 overflow-y-auto px-3">
      {[...groups].map(([label, items]) => (
        <div key={label} className="mb-3">
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          {items.map((t) => (
            <div key={t._id} className={cn("group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-mint", t._id === activeId && "bg-mint")}>
              <Link href={`/director?thread=${t._id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-200 to-teal-400 text-xs font-bold text-white">{t.title.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{t.title}</span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <span className={cn("size-1.5 rounded-full", t.status === "ready" ? "bg-brand-bright" : "bg-amber-400")} />
                    {t.status === "ready" ? "Ready" : "Drafting"}
                  </span>
                </span>
              </Link>
              <button
                aria-label="Delete reel"
                onClick={async () => {
                  if (!confirm("Delete this reel?")) return;
                  await api(`/api/director/threads/${t._id}`, { method: "DELETE" });
                  onDeleted();
                  if (t._id === activeId) router.replace("/director");
                }}
                className="hidden text-muted hover:text-red-600 group-hover:block"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (goal: string) => Promise<void> }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const pick = async (g: string) => {
    if (!g.trim() || busy) return;
    setBusy(g);
    await onPick(g.trim());
  };
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 text-center">
        <DirectorAvatar size={84} />
        <h1 className="font-display text-2xl font-bold">Hi, I&apos;m {DIRECTOR_NAME} 🎬</h1>
        <p className="max-w-md text-muted">Let&apos;s make a reel that helps your business. What should it do?</p>
        <div className="mt-2 flex max-w-2xl flex-wrap justify-center gap-2">
          {REEL_GOALS.map((g) => (
            <button key={g} onClick={() => pick(g)} disabled={!!busy} className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-brand/40 hover:bg-mint disabled:opacity-60">
              {busy === g && <Loader2 className="size-4 animate-spin" />} {g}
            </button>
          ))}
        </div>
      </div>
      <Composer value={input} onChange={setInput} onSubmit={() => pick(input)} busy={!!busy} />
    </>
  );
}

function ThreadChat({ threadId, initialPrompt, onUpdate }: { threadId: string; initialPrompt?: string; onUpdate: () => void }) {
  const thread = useSWR<{ thread: ThreadFull }>(`/api/director/threads/${threadId}`, (p: string) => api<{ thread: ThreadFull }>(p), { revalidateOnFocus: false });
  if (!thread.data) {
    return <div className="grid flex-1 place-items-center">{thread.error ? <p className="text-muted">This reel was not found.</p> : <Loader2 className="size-6 animate-spin text-brand" />}</div>;
  }
  return <Conversation thread={thread.data.thread} initialPrompt={initialPrompt} onFinish={() => { thread.mutate(); onUpdate(); }} />;
}

function Conversation({ thread, initialPrompt, onFinish }: { thread: ThreadFull; initialPrompt?: string; onFinish: () => void }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    id: thread._id,
    messages: thread.messages,
    transport: new DefaultChatTransport({ api: "/api/director/chat", body: { threadId: thread._id } }),
    onFinish,
  });
  const busy = status === "submitted" || status === "streaming";
  const sent = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && !sent.current && thread.messages.length === 0) {
      sent.current = true;
      sendMessage({ text: initialPrompt });
    }
  }, [initialPrompt, thread.messages.length, sendMessage]);

  // Scroll only the chat pane, never the page.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thread.plan]);

  const send = () => {
    if (!input.trim() || busy) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  return (
    <>
      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((m) => {
            const text = m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join("");
            if (!text) return null;
            return (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role !== "user" && <DirectorAvatar size={32} />}
                <div className={cn("max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed", m.role === "user" ? "bg-brand text-white" : "border border-line bg-paper")}>
                  {renderBold(text)}
                </div>
              </div>
            );
          })}
          {status === "submitted" && <div className="flex gap-3"><DirectorAvatar size={32} /><span className="flex items-center gap-1 rounded-2xl border border-line bg-paper px-4 py-3"><Dot /><Dot d={150} /><Dot d={300} /></span></div>}
          {thread.plan && !busy && <ReelPlanCard plan={thread.plan} />}
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error.message || "Something went wrong. Try again."}</p>}
        </div>
      </div>
      <Composer value={input} onChange={setInput} onSubmit={send} busy={busy} />
    </>
  );
}

function Composer({ value, onChange, onSubmit, busy }: { value: string; onChange: (v: string) => void; onSubmit: () => void; busy: boolean }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="border-t border-line px-4 py-4">
      <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-line bg-white p-2 pl-3 shadow-lg">
        <Link href="/ideas" aria-label="Start from an idea" title="Start from an idea" className="grid size-10 place-items-center rounded-full hover:bg-mint"><Plus className="size-5" /></Link>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Tell ${DIRECTOR_NAME} about your reel`} className="flex-1 bg-transparent py-2 text-[15px] outline-none" />
        <button disabled={busy || !value.trim()} aria-label="Send" className="grid size-11 place-items-center rounded-full bg-brand-bright text-white disabled:opacity-40">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
        </button>
      </div>
    </form>
  );
}

function dayLabel(iso: string) {
  const d = new Date(iso).toDateString();
  if (d === new Date().toDateString()) return "Today";
  if (d === new Date(Date.now() - 864e5).toDateString()) return "Yesterday";
  return "Earlier";
}

const Dot = ({ d = 0 }: { d?: number }) => <span className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d}ms` }} />;

function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>));
}
