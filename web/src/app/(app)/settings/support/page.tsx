import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata = { title: "Support" };

const FAQ = [
  ["How do credits work?", "Studio photos use 1 credit each. A marketplace pack uses 4. Calendar posts, ideas and director reel plans are free. If a job fails, the credits come back automatically."],
  ["Why do my studio photos say Preview?", "Real model photos need the image model switched on. Until then you see your garment on the chosen scene so you can check the flow."],
  ["Will you post to Instagram for me?", "Your handle is saved now. Direct publishing starts once our Meta app is approved. Until then, download the image and copy the caption from Calendar."],
  ["Is my data safe as a guest?", "Yes, but it lives on this browser. Sign in with email or phone and everything you've made moves to your account."],
  ["Which languages do you support?", "English, Hinglish, Hindi, Tamil, Telugu, Gujarati, Malayalam, Indonesian and Turkish. Set it under My Business → More business details."],
];

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight">Support</h1>
        <p className="mt-2 text-muted">Quick answers, or talk to a person.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${brand.supportEmail}`} className="flex items-center gap-4 rounded-3xl border border-line p-5 hover:bg-mint">
          <span className="grid size-12 place-items-center rounded-2xl bg-mint text-brand"><Mail className="size-6" /></span>
          <span><span className="block font-semibold">Email us</span><span className="text-sm text-muted">{brand.supportEmail}</span></span>
        </a>
        <Link href="/copilot" className="flex items-center gap-4 rounded-3xl border border-line p-5 hover:bg-mint">
          <span className="grid size-12 place-items-center rounded-2xl bg-mint text-brand"><MessageCircle className="size-6" /></span>
          <span><span className="block font-semibold">Ask Copilot</span><span className="text-sm text-muted">Instant help with posts, captions and ideas</span></span>
        </Link>
      </div>
      <section className="divide-y divide-line rounded-3xl border border-line">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="cursor-pointer list-none font-semibold marker:hidden">{q}<span className="float-right text-muted group-open:rotate-45">+</span></summary>
            <p className="mt-2 text-sm text-muted">{a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
