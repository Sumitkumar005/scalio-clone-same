import { Suspense } from "react";
import { DirectorWorkspace } from "@/components/director/director-workspace";
import { DIRECTOR_NAME } from "@/config/nav";

export const metadata = { title: DIRECTOR_NAME };

export default function DirectorPage() {
  return (
    <Suspense fallback={null}>
      <DirectorWorkspace />
    </Suspense>
  );
}
