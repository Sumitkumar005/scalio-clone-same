import { IdeasGrid } from "@/components/ideas/ideas-grid";
import { LibraryView } from "@/components/library/library-view";

export const metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <div className="flex flex-col gap-12">
      <LibraryView />
      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Saved ideas</h2>
        <IdeasGrid limit={100} status="saved" />
      </section>
    </div>
  );
}
