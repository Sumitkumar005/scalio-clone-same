"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { NAV } from "@/config/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white p-5 md:flex">
        <BrandLogo className="mb-8 px-2" />
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink/80 transition hover:bg-mint",
                pathname.startsWith(href) && "bg-mint font-semibold text-brand",
              )}
            >
              <Icon className="size-5" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted", pathname.startsWith(href) && "text-brand")}
          >
            <Icon className="size-5" /> {label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </>
  );
}
