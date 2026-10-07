"use client";

import { Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMe } from "@/lib/api";

export function SubmitBar({ cost, disabled, busy, error, onSubmit, label }: { cost: number; disabled: boolean; busy: boolean; error: string | null; onSubmit: () => void; label: string }) {
  const { data: me } = useMe();
  const short = me && me.credits < cost;
  return (
    <div className="sticky bottom-20 z-10 rounded-3xl border border-line bg-white/95 p-4 shadow-xl backdrop-blur lg:bottom-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm">
          <Coins className="size-4 text-brand" /> Costs <b>{cost} credit{cost > 1 ? "s" : ""}</b>
          {me && <span className="text-muted">· you have {me.credits}</span>}
        </span>
        {short && <Link href="/billing" className="text-sm font-semibold text-brand underline">Get more credits</Link>}
        <button onClick={onSubmit} disabled={disabled || busy || !!short} className="ml-auto flex h-12 items-center gap-2 rounded-2xl bg-brand-bright px-6 font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand disabled:bg-line disabled:text-muted disabled:shadow-none">
          {busy && <Loader2 className="size-4 animate-spin" />} {label}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
