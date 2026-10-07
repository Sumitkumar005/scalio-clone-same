import { ResultView } from "./result-view";

export const metadata = { title: "Studio result" };

export default async function Page({ params }: PageProps<"/studio/result/[id]">) {
  const { id } = await params;
  return <ResultView id={id} />;
}
