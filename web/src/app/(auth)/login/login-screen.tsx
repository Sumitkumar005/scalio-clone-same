"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { LanguagePicker } from "@/components/auth/language-picker";
import { MobileCollage } from "@/components/auth/mobile-collage";
import { Showcase } from "@/components/auth/showcase";
import { SignInForm } from "@/components/auth/sign-in-form";
import { brand } from "@/config/brand";
import { LANGUAGES, t, type LangCode } from "@/lib/i18n";

const LANG_KEY = "app.lang";

// Language preference lives in localStorage; read it without a hydration mismatch.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function readLang(): LangCode {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved as LangCode;
  } catch {}
  return "en";
}

export function LoginScreen() {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as LangCode);

  const changeLang = (code: LangCode) => {
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch {}
    listeners.forEach((l) => l());
  };

  const d = t(lang);

  return (
    <main className="h-dvh w-full">
      {/* Desktop: split view */}
      <div className="hidden h-full lg:grid lg:grid-cols-2">
        <Showcase />
        <section className="flex flex-col bg-white px-12 py-10">
          <header className="flex items-center justify-between">
            <BrandLogo />
            <LanguagePicker value={lang} onChange={changeLang} />
          </header>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8">
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              {d.welcome} {brand.name}
            </h1>
            <SignInForm lang={lang} />
            <Footer />
          </div>
        </section>
      </div>

      {/* Mobile: collage + bottom sheet */}
      <div className="relative h-full lg:hidden">
        <MobileCollage />
        <header className="relative z-10 flex items-start justify-between gap-3 p-4">
          <div>
            <BrandLogo light className="text-4xl" />
            <p className="mt-2 font-display text-xl font-bold text-white">{brand.tagline}</p>
            <p className="text-sm font-semibold text-white/90">Content, reels and ads in one app</p>
          </div>
          <LanguagePicker value={lang} onChange={changeLang} />
        </header>
        <section className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl bg-paper px-4 pb-6 pt-6 shadow-[0_-12px_40px_rgba(0,0,0,0.15)]">
          <h1 className="mb-5 font-display text-2xl font-bold text-ink">Sign in to {brand.name}</h1>
          <SignInForm lang={lang} compact />
          <Footer />
        </section>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <div className="mt-3 flex flex-col items-center gap-1 text-xs text-muted">
      <Link href="/onboarding" className="mb-3 text-sm font-semibold text-brand hover:underline">Try it first, no sign-up →</Link>
      <div className="flex gap-3">
        <Link href="/legal/terms" className="hover:text-ink">Terms</Link>·
        <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>·
        <a href={`mailto:${brand.supportEmail}`} className="hover:text-ink">Need help?</a>
      </div>
      <span className="text-[11px] text-muted/70">v{brand.version}</span>
    </div>
  );
}
