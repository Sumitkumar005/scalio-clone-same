import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { CopilotChat } from "./copilot-chat";

export const metadata = { title: "Copilot" };

export default function CopilotPage() {
  return (
    <>
      <PageHeader title="Copilot" subtitle="Captions, reel scripts, offers, replies. Ask in any language." />
      <Suspense fallback={null}>
        <CopilotChat />
      </Suspense>
    </>
  );
}
