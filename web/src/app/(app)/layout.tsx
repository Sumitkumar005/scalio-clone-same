import { ChatFab } from "@/components/app/chat-fab";
import { OnboardingGuard } from "@/components/app/onboarding-guard";
import { TopNav } from "@/components/app/top-nav";
import { SessionGate } from "@/components/session-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGate>
      <OnboardingGuard />
      <div className="min-h-dvh bg-[linear-gradient(180deg,#f3fbf6_0%,#eefff4_100%)]">
        <TopNav />
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-8 lg:pb-12">{children}</main>
        <ChatFab />
      </div>
    </SessionGate>
  );
}
