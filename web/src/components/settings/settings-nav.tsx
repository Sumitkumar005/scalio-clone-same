"use client";

import { ArrowLeft, Building2, CalendarDays, CreditCard, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/settings/business", label: "My Business", Icon: Building2 },
  { href: "/settings/billing", label: "Billing", Icon: CreditCard },
  { href: "/settings/planner", label: "Posts Planner", Icon: CalendarDays },
];

export function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="relative flex flex-col overflow-hidden border-b border-line bg-paper/50 p-5 lg:min-h-[calc(100dvh-8rem)] lg:border-b-0 lg:border-r">
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-mint" />
      <button onClick={() => router.back()} className="relative flex items-center gap-2 self-start text-sm font-semibold text-ink/80 hover:text-ink">
        <ArrowLeft className="size-4" /> Back
      </button>
      <p className="relative mt-6 text-xs font-bold uppercase tracking-wider text-brand">Your workspace</p>
      <h1 className="relative font-display text-3xl font-bold">Settings</h1>
      <p className="relative mt-1 text-sm text-muted">Keep your business details and plan up to date.</p>
      <nav className="relative mt-6 flex gap-1 overflow-x-auto lg:flex-col">
        {ITEMS.map(({ href, label, Icon }) => {
          const on = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold transition", on ? "bg-white text-brand shadow-sm" : "text-ink/75 hover:bg-white")}>
              <span className={cn("grid size-10 place-items-center rounded-xl", on ? "bg-mint text-brand" : "bg-white text-muted")}><Icon className="size-5" /></span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="relative mt-6 border-t border-line pt-4 lg:mt-auto">
        <p className="text-sm text-muted">Questions or account help?</p>
        <Link href="/settings/support" className={cn("mt-2 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 font-semibold hover:bg-mint", pathname.startsWith("/settings/support") && "border-brand text-brand")}>
          <LifeBuoy className="size-5" /> Support
        </Link>
      </div>
    </aside>
  );
}
