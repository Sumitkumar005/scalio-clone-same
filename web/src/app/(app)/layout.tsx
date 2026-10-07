import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar />
      <main className="flex-1 px-4 pb-24 pt-8 md:px-10 md:pb-10">{children}</main>
    </div>
  );
}
