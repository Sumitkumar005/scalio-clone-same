import { ComingSoon, PageHeader } from "@/components/app/page-header";
import { IdeasGrid } from "@/components/ideas/ideas-grid";

export const metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <PageHeader title="Library" subtitle="Everything you've saved and created." />
        <h2 className="mb-4 font-display text-xl font-bold">Saved ideas</h2>
        <IdeasGrid limit={100} status="saved" />
      </div>
      <ComingSoon items={["Generated videos and reels", "Photoshoot outputs", "Downloads and share links"]} />
    </div>
  );
}
