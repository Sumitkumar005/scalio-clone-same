import { ComingSoon, PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Reels" };

export default function Page() {
  return (
    <>
      <PageHeader title="Reels" subtitle="Pick a proven template, drop in your product, publish." />
      <ComingSoon items={["Proven template gallery with categories", "Template detail and build flow", "Image-to-video and AI avatar videos", "Video agent chat to edit a reel", "Render queue + review screen"]} />
    </>
  );
}
