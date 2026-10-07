import { ComingSoon, PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Calendar" };

export default function Page() {
  return (
    <>
      <PageHeader title="Calendar" subtitle="AI plans a month of posts around festivals, sales and your goals." />
      <ComingSoon items={["Business onboarding questions", "Monthly grid with idea cards", "Generate / regenerate / approve ideas", "One-tap create from an idea", "Schedule and auto-publish"]} />
    </>
  );
}
