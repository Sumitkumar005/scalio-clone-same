"use client";

import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { t, type LangCode } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Step = "choose" | "email" | "phone" | "sent";

export function SignInForm({ lang, compact }: { lang: LangCode; compact?: boolean }) {
  const d = t(lang);
  const router = useRouter();
  const [step, setStep] = useState<Step>("choose");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  async function withGoogle() {
    if (!isSupabaseConfigured) return router.push("/home");
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) setError(error.message);
    setBusy(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) return router.push("/home");
    setBusy(true);
    const supabase = createClient();
    const { error } =
      step === "email"
        ? await supabase.auth.signInWithOtp({ email: value, options: { emailRedirectTo: redirectTo() } })
        : await supabase.auth.signInWithOtp({ phone: value });
    setBusy(false);
    if (error) setError(error.message);
    else setStep("sent");
  }

  if (step === "sent") {
    return <p className="rounded-2xl bg-mint p-4 text-center text-sm font-medium text-brand">{d.linkSent}</p>;
  }

  if (step === "email" || step === "phone") {
    return (
      <form onSubmit={submit} className="flex w-full flex-col gap-3">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted">{d.emailPrompt}</p>
        <input
          autoFocus
          required
          type={step === "email" ? "email" : "tel"}
          inputMode={step === "email" ? "email" : "tel"}
          placeholder={step === "email" ? "you@business.com" : "+91 98765 43210"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-13 rounded-xl border border-line bg-white px-4 text-base outline-none ring-brand/30 focus:ring-4"
        />
        <button disabled={busy} className="flex h-13 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {d.sendLink}
        </button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button type="button" onClick={() => setStep("choose")} className="flex items-center justify-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> {d.back}
        </button>
      </form>
    );
  }

  if (compact) {
    return (
      <div className="flex w-full flex-col gap-1">
        <button onClick={withGoogle} disabled={busy} className="flex h-13 items-center justify-center gap-3 rounded-xl border border-line bg-white font-semibold text-ink transition hover:bg-mint">
          <GoogleIcon /> {d.google}
        </button>
        <button onClick={() => setStep("email")} className="h-12 font-semibold text-brand">{d.email}</button>
        <button onClick={() => setStep("phone")} className="h-10 font-semibold text-brand">{d.phone}</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted">{d.choose}</p>
      <div className="grid grid-cols-3 gap-3">
        <IconButton label={d.google} onClick={withGoogle}><GoogleIcon /></IconButton>
        <IconButton label={d.email} onClick={() => setStep("email")}><Mail className="size-5 text-ink/70" /></IconButton>
        <IconButton label={d.phone} onClick={() => setStep("phone")}><Phone className="size-5 text-ink/70" /></IconButton>
      </div>
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("grid h-13 place-items-center rounded-xl border border-line bg-white transition hover:border-brand/40 hover:bg-mint")}
    >
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
