import { PageHeader } from "@/components/app/page-header";
import { IdeasGrid } from "@/components/ideas/ideas-grid";

export const metadata = { title: "Ideas" };

export default function IdeasPage() {
  return (
    <>
      <PageHeader title="All ideas" subtitle="Made for your business. Save the ones you like to your library." />
      <IdeasGrid limit={100} showRefresh />
    </>
  );
}
