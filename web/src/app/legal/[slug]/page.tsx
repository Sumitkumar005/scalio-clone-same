import { notFound } from "next/navigation";
import { brand } from "@/config/brand";

const PAGES: Record<string, string> = { terms: "Terms of Service", privacy: "Privacy Policy" };

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const title = PAGES[slug];
  if (!title) notFound();
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-muted">
        {brand.name} {title.toLowerCase()} goes here. Have counsel draft this before launch (DPDP Act 2023 for India, GDPR if you serve the EU).
      </p>
    </main>
  );
}
