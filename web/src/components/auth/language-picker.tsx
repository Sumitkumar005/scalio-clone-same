"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, type LangCode } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguagePicker({
  value,
  onChange,
  className,
}: {
  value: LangCode;
  onChange: (code: LangCode) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white/90 px-4 py-2.5 text-sm font-semibold text-ink shadow-sm backdrop-blur transition hover:bg-white"
      >
        <span className="hidden sm:inline">Language: </span>{current.english}
        <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-xl"
        >
          <li className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Select language</li>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === value}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-mint"
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1">
                  {l.native}
                  {l.native !== l.english && <span className="text-muted"> · {l.english}</span>}
                </span>
                {l.code === value && <Check className="size-4 text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
