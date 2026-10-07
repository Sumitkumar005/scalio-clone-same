"use client";

import { ArrowLeft, ArrowRight, AtSign, Camera, Check, Link2, Loader2, Send, ShieldCheck, Sparkles, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { GuideCard } from "@/components/onboarding/guide-card";
import { SideShowcase } from "@/components/onboarding/side-showcase";
import { api, useMe, type BusinessDTO } from "@/lib/api";
import { CATEGORIES, GOALS, type GoalId } from "@/lib/domain";
import { cn } from "@/lib/utils";

const STEPS = ["welcome", "goals", "website", "business", "instagram"] as const;
type Step = (typeof STEPS)[number] | "building";

export function OnboardingFlow() {
  const router = useRouter();
  const { data: me, mutate } = useMe();
  const [picked, setStep] = useState<Step | null>(null);

  // Resume where the owner left off; local navigation overrides once they move.
  const saved = me?.business?.onboardingStep;
  const resumed: Step = saved && (STEPS as readonly string[]).includes(saved) ? (saved as Step) : "welcome";
  const step: Step | null = me ? (picked ?? resumed) : null;

  useEffect(() => {
    if (saved === "done" && !picked) router.replace("/home");
  }, [saved, picked, router]);

  const go = async (next: Step, patch: Partial<BusinessDTO> = {}) => {
    if (next !== "building") {
      const { business } = await api<{ business: BusinessDTO }>("/api/business", { method: "PATCH", json: { ...patch, onboardingStep: next } });
      mutate((m) => (m ? { ...m, business } : m), { revalidate: false });
    }
    setStep(next);
  };

  if (!me || !step) return <Centered><Loader2 className="size-6 animate-spin text-brand" /></Centered>;

  const b = me.business;
  const idx = STEPS.indexOf(step as (typeof STEPS)[number]);
  const back = idx > 0 ? () => setStep(STEPS[idx - 1]) : undefined;

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,40%)_1fr]">
      <SideShowcase step={step === "building" ? "instagram" : step} />
      <main className="flex min-h-dvh flex-col bg-white">
        {step !== "welcome" && step !== "building" && (
          <header className="flex items-center gap-5 px-5 pt-6 sm:px-10">
            <button onClick={back} aria-label="Back" className="rounded-full p-1 hover:bg-mint">
              <ArrowLeft className="size-6" />
            </button>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand-bright transition-all duration-500" style={{ width: `${(idx / (STEPS.length - 1)) * 100}%` }} />
            </div>
          </header>
        )}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-6 sm:px-10">
          {step === "welcome" && <Welcome onNext={() => go("goals")} />}
          {step === "goals" && <Goals initial={b?.goals ?? []} onNext={(goals) => go("website", { goals })} />}
          {step === "website" && (
            <Website
              initial={b?.website ?? ""}
              onRead={async (url) => {
                await api("/api/onboarding/website", { method: "POST", json: { url } });
                await go("business");
              }}
              onSkip={() => go("business")}
            />
          )}
          {step === "business" && b && <BusinessForm b={b} onNext={(patch) => go("instagram", patch)} />}
          {step === "instagram" && (
            <InstagramStep
              initial={b?.instagram ?? ""}
              onNext={async (instagram) => {
                await go("building", {});
                await api("/api/business", { method: "PATCH", json: { instagram } });
                await api("/api/onboarding/complete", { method: "POST" });
                await mutate();
                router.replace("/home");
              }}
            />
          )}
          {step === "building" && <Building name={b?.name} />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Steps ---------------- */

function Welcome({ onNext }: { onNext: () => void }) {
  const [busy, setBusy] = useState(false);
  const items = [
    { Icon: Sparkles, text: "Pick what you want us to create" },
    { Icon: Store, text: "Tell us about your business, we learn your brand" },
    { Icon: Send, text: "Get your first content ideas, free" },
  ];
  return (
    <div className="flex flex-1 flex-col pt-8">
      <div className="text-center">
        <BrandLogo className="text-5xl" />
        <h1 className="mt-3 font-display text-xl font-bold text-ink sm:text-2xl">
          Posts, reels and ads for your business, <span className="text-brand-bright">made in minutes</span>
        </h1>
      </div>
      <GuideCard className="mx-auto mt-6 max-w-md" chips={["Content ideas", "Promo videos", "Image ads"]} subtitle="Your marketing team, in one app" />
      <div className="mx-auto mt-8 w-full max-w-md">
        <p className="text-muted">Here&apos;s what happens next</p>
        <ul className="mt-3 space-y-3">
          {items.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-mint text-brand"><Icon className="size-5" /></span>
              <span className="text-[17px] text-ink">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <PrimaryButton className="mt-auto" busy={busy} onClick={() => { setBusy(true); onNext(); }}>Let&apos;s start</PrimaryButton>
    </div>
  );
}

function Goals({ initial, onNext }: { initial: GoalId[]; onNext: (g: GoalId[]) => Promise<void> }) {
  const [sel, setSel] = useState<GoalId[]>(initial.length ? initial : ["videos", "posts"]);
  const [busy, setBusy] = useState(false);
  const toggle = (id: GoalId) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <StepShell
      guide={{ title: "What should we make?", chips: ["Reels", "Posts", "Photos"], subtitle: "Jo chahiye, woh select kijiye" }}
      title="What do you want us to make for you?"
      subtitle="Pick as many as you like. You can change this later."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {GOALS.map((g) => {
          const on = sel.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={cn("flex items-center justify-between rounded-2xl border px-4 py-4 text-left font-semibold transition", on ? "border-brand bg-mint text-brand" : "border-line hover:border-brand/40")}
            >
              {g.label}
              <span className={cn("grid size-6 place-items-center rounded-full border", on ? "border-brand bg-brand text-white" : "border-line")}>{on && <Check className="size-4" />}</span>
            </button>
          );
        })}
      </div>
      <PrimaryButton className="mt-6" disabled={!sel.length} busy={busy} onClick={async () => { setBusy(true); await onNext(sel); }}>Continue</PrimaryButton>
    </StepShell>
  );
}

function Website({ initial, onRead, onSkip }: { initial: string; onRead: (url: string) => Promise<void>; onSkip: () => void }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onRead(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that website");
      setBusy(false);
    }
  };
  return (
    <StepShell
      guide={{ title: "Enter your website", chips: ["Website link", "Business details"], subtitle: "Website ka link paste kijiye" }}
      title="What's your website?"
      subtitle="We'll read it so you don't have to type any of this."
    >
      <form onSubmit={submit}>
        <label className="flex items-center gap-3 rounded-2xl border border-line px-5 focus-within:ring-4 focus-within:ring-brand/20">
          <Link2 className="size-5 text-muted" />
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourstore.com" inputMode="url" className="h-16 flex-1 bg-transparent text-lg outline-none" />
        </label>
        {busy && <p className="mt-3 flex items-center gap-2 text-sm text-brand"><Loader2 className="size-4 animate-spin" /> Reading your website, this takes a few seconds…</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}. You can fix the link or skip this step.</p>}
        <PrimaryButton type="submit" className="mt-6" disabled={url.trim().length < 4} busy={busy}>Continue</PrimaryButton>
      </form>
      <button onClick={onSkip} className="mt-4 w-full text-center text-muted hover:text-ink">I don&apos;t have a website</button>
    </StepShell>
  );
}

function BusinessForm({ b, onNext }: { b: BusinessDTO; onNext: (patch: Partial<BusinessDTO>) => Promise<void> }) {
  const [f, setF] = useState({
    name: b.name ?? "",
    category: b.category ?? "",
    description: b.description ?? "",
    offerings: (b.offerings ?? []).join(", "),
    audience: b.audience ?? "",
    city: b.city ?? "",
    language: b.language ?? "en",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const fromSite = Boolean(b.siteSnapshot);
  return (
    <StepShell
      guide={{ title: "Your business", chips: ["Products", "Customers", "City"], subtitle: "Aapke business ke baare mein batayiye" }}
      title={fromSite ? "Here's what we learned" : "Tell us about your business"}
      subtitle={fromSite ? "We filled this from your website. Fix anything we got wrong." : "Two minutes now saves you hours of typing later."}
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onNext({
            ...f,
            category: (f.category || undefined) as BusinessDTO["category"],
            offerings: f.offerings.split(",").map((s) => s.trim()).filter(Boolean),
          });
        }}
      >
        <Field label="Business name"><input required value={f.name} onChange={set("name")} className={input} placeholder="Sharma Sarees" /></Field>
        <Field label="Category">
          <select required value={f.category} onChange={set("category")} className={input}>
            <option value="" disabled>Choose one</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="What you sell" hint="Comma separated" className="sm:col-span-2"><input value={f.offerings} onChange={set("offerings")} className={input} placeholder="Banarasi sarees, kurtis, bridal wear" /></Field>
        <Field label="One line about you" className="sm:col-span-2"><textarea rows={2} value={f.description} onChange={set("description")} className={cn(input, "h-auto py-3")} /></Field>
        <Field label="Who buys from you"><input value={f.audience} onChange={set("audience")} className={input} placeholder="Women 25-45 in Pune" /></Field>
        <Field label="City"><input value={f.city} onChange={set("city")} className={input} placeholder="Pune" /></Field>
        <Field label="Content language">
          <select value={f.language} onChange={set("language")} className={input}>
            <option value="en">English</option><option value="hinglish">Hinglish</option><option value="hi">Hindi</option><option value="ta">Tamil</option><option value="te">Telugu</option><option value="gu">Gujarati</option><option value="ml">Malayalam</option>
          </select>
        </Field>
        <PrimaryButton type="submit" className="sm:col-span-2" busy={busy} disabled={!f.name || !f.category}>Continue</PrimaryButton>
      </form>
    </StepShell>
  );
}

function InstagramStep({ initial, onNext }: { initial: string; onNext: (handle: string) => Promise<void> }) {
  const [handle, setHandle] = useState(initial);
  const [busy, setBusy] = useState(false);
  const finish = async (h: string) => {
    setBusy(true);
    await onNext(h);
  };
  return (
    <StepShell
      guide={{ chips: ["Learns brand style", "From your Instagram"], subtitle: "Aapka brand style samajh lenge" }}
      title="What's your Instagram?"
      subtitle="We'll learn your style from your recent posts."
    >
      <div className="rounded-2xl border border-line bg-paper p-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white"><Camera className="size-7" /></span>
          <div className="flex-1">
            <p className="font-semibold">Instagram handle</p>
            <p className="text-sm text-muted">Full connect (publish, schedule, insights) arrives with Meta approval.</p>
          </div>
          <ShieldCheck className="size-5 text-brand" />
        </div>
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white px-4">
          <AtSign className="size-4 text-muted" />
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourbrand" className="h-12 flex-1 bg-transparent outline-none" />
        </label>
      </div>
      <PrimaryButton className="mt-4" busy={busy} disabled={!handle.trim()} onClick={() => finish(handle)}>Save Instagram</PrimaryButton>
      <button disabled={busy} onClick={() => finish("")} className="mt-4 w-full text-center text-muted hover:text-ink">Skip for now</button>
    </StepShell>
  );
}

function Building({ name }: { name?: string }) {
  return (
    <Centered>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-mint"><Loader2 className="size-8 animate-spin text-brand" /></span>
        <h2 className="font-display text-2xl font-bold">Making ideas for {name || "your business"}…</h2>
        <p className="text-muted">Picking hooks, scenes and formats that fit what you sell.</p>
      </div>
    </Centered>
  );
}

/* ---------------- Building blocks ---------------- */

const input = "h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:ring-4 focus:ring-brand/20";

function StepShell({ guide, title, subtitle, children }: { guide: { title?: string; chips: string[]; subtitle: string }; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col pt-6 animate-in">
      <GuideCard {...guide} />
      <h1 className="mt-6 font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      <p className="mb-5 mt-1 text-muted">{subtitle}</p>
      {children}
    </div>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-semibold text-ink", className)}>
      <span>{label} {hint && <span className="font-normal text-muted">· {hint}</span>}</span>
      {children}
    </label>
  );
}

function PrimaryButton({ busy, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={cn(
        "relative flex h-16 w-full items-center justify-center rounded-2xl bg-brand-bright text-lg font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand disabled:bg-line disabled:text-muted disabled:shadow-none",
        className,
      )}
    >
      {busy ? <Loader2 className="size-5 animate-spin" /> : children}
      {!busy && <ArrowRight className="absolute right-6 size-5" />}
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="grid flex-1 place-items-center py-20">{children}</div>;
}

