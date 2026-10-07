"use client";

import { AlertTriangle, Coins, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { NAV } from "@/config/nav";
import { useMe } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const { data: me } = useMe();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:h-20 md:px-8">
          <Link href="/home"><BrandLogo /></Link>
          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] text-ink/80 transition hover:bg-mint", pathname.startsWith(href) && "font-semibold text-ink")}
              >
                <Icon className="size-[18px]" /> {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <CreditsPill credits={me?.credits} />
            <AccountMenu isGuest={me?.user.isGuest ?? true} email={me?.user.email ?? null} />
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.slice(0, 5).map((n) => (
          <Link key={n.href} href={n.href} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted", pathname.startsWith(n.href) && "text-brand")}>
            <n.icon className="size-5" /> {"short" in n ? n.short : n.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

function CreditsPill({ credits }: { credits?: number }) {
  if (credits === undefined) return <span className="h-10 w-24 animate-pulse rounded-2xl bg-mint" />;
  const empty = credits <= 0;
  return (
    <Link
      href="/settings/billing"
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-sm font-semibold md:h-12 md:px-4",
        empty ? "border-red-200 bg-red-50 text-red-600" : "border-line bg-mint text-brand",
      )}
    >
      {empty ? <AlertTriangle className="size-4" /> : <Coins className="size-4" />} {credits} credits
    </Link>
  );
}

function AccountMenu({ isGuest, email }: { isGuest: boolean; email: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button aria-label="Account" onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-full border border-line bg-white hover:bg-mint md:size-12">
        <User className="size-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-xl">
          <p className="px-3 py-2 text-sm text-muted">{isGuest ? "You're using a guest account" : email}</p>
          {isGuest ? (
            <Link href="/login" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand hover:bg-mint">
              <LogIn className="size-4" /> Sign in to save your work
            </Link>
          ) : (
            <button
              onClick={async () => {
                await authClient.signOut();
                router.replace("/login");
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-mint"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
