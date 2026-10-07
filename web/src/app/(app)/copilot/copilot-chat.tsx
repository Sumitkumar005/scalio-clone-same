"use client";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STARTERS = [
  "Write 3 Instagram captions for a Diwali sale at my saree shop",
  "Script a 20-second reel for a new cafe menu item",
  "Reply politely to a 2-star Google review about late delivery",
];

export function CopilotChat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {messages.length === 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {STARTERS.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-2xl border border-line bg-white p-4 text-left text-sm hover:bg-mint">
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
              m.role === "user" ? "self-end bg-brand text-white" : "self-start border border-line bg-white",
            )}
          >
            {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
          </div>
        ))}
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Copilot is offline. Add GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY to .env.local.
          </p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-20 flex items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-lg md:bottom-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot…"
          className="flex-1 bg-transparent px-3 py-2 outline-none"
        />
        <button disabled={busy} aria-label="Send" className="grid size-10 place-items-center rounded-xl bg-brand text-white disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </button>
      </form>
    </div>
  );
}
