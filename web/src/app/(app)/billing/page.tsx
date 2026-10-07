import { ComingSoon, PageHeader } from "@/components/app/page-header";

export const metadata = { title: "Plan" };

export default function Page() {
  return (
    <>
      <PageHeader title="Plan" subtitle="Your plan, credits and invoices." />
      <ComingSoon items={["Plan cards and trial", "Checkout (Razorpay / Stripe)", "Credit balance and usage", "Manage subscription"]} />
    </>
  );
}
