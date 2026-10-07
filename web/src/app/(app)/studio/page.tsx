import { ComingSoon, PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Photo Studio" };

export default function Page() {
  return (
    <>
      <PageHeader title="Photo Studio" subtitle="Upload a product photo, pick a scene and pose, get studio-quality shots." />
      <ComingSoon items={["Upload garment / product image (Cloudflare R2)", "Scene + pose + model picker", "Generate N variations (image model via job queue)", "Outros and branded frames", "Download and publish to Instagram"]} />
    </>
  );
}
