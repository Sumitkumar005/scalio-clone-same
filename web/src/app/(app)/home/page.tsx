import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { NAV } from "@/config/nav";

export const metadata = { title: "Home" };

const BLURBS: Record<string, string> = {
  "/studio": "Turn one product photo into a full shoot",
  "/reels": "Proven reel templates, ready to post",
  "/calendar": "A month of posts planned around your business",
  "/growth": "Google profile, reviews, website and ads",
  "/copilot": "Ask anything about your marketing",
  "/billing": "Your plan and credits",
};

export default function HomePage() {
  return (
    <>
      <PageHeader title="Good to see you 👋" subtitle="What do you want to create today?" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {NAV.filter((n) => n.href !== "/home").map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <span className="grid size-12 place-items-center rounded-2xl bg-mint text-brand"><Icon className="size-6" /></span>
            <h2 className="mt-4 font-display text-xl font-bold">{label}</h2>
            <p className="mt-1 text-sm text-muted">{BLURBS[href]}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
