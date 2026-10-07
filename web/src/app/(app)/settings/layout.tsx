import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm lg:grid lg:grid-cols-[280px_1fr]">
      <SettingsNav />
      <div className="min-w-0 px-4 py-6 sm:px-8 lg:px-12 lg:py-10">{children}</div>
    </div>
  );
}
