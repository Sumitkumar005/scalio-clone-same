import { ComingSoon, PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Growth" };

export default function Page() {
  return (
    <>
      <PageHeader title="Growth" subtitle="Get found on Google, collect reviews, run ads and never miss a message." />
      <ComingSoon items={["Google Business Profile connect + sync", "Review inbox with AI replies", "Profile optimizer and posts", "Website builder", "Meta + Google ads", "WhatsApp AI receptionist"]} />
    </>
  );
}
