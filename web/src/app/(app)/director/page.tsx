import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { DIRECTOR_NAME } from "@/config/nav";
import { CopilotChat } from "../copilot/copilot-chat";

export const metadata = { title: DIRECTOR_NAME };

const STARTERS = [
  "Plan a 20-second reel for my best-selling product, scene by scene",
  "Give me 5 hooks for a reel about our current offer, in Hinglish",
  "Turn my top customer question into a presenter-led video script",
];

export default function DirectorPage() {
  return (
    <>
      <PageHeader title={`${DIRECTOR_NAME}, your video director`} subtitle="Describe the video you want. Get the hook, script, scenes and caption." />
      <Suspense fallback={null}>
        <CopilotChat starters={STARTERS} placeholder={`Tell ${DIRECTOR_NAME} what video you need…`} />
      </Suspense>
    </>
  );
}
