import { PageHeader } from "@/components/app/page-header";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Your business profile powers every idea, post and video." />
      <SettingsForm />
    </>
  );
}
