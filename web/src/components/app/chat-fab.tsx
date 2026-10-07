import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function ChatFab() {
  return (
    <Link
      href="/copilot"
      aria-label="Ask Copilot"
      className="fixed bottom-20 right-4 z-30 grid size-14 place-items-center rounded-full bg-brand-bright text-white shadow-xl shadow-brand/30 transition hover:scale-105 lg:bottom-8 lg:right-8 lg:size-16"
    >
      <MessageCircle className="size-7" />
    </Link>
  );
}
