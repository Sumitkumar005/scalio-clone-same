"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/lib/api";

/** Soft guard: owners who haven't finished setup get sent to onboarding. */
export function OnboardingGuard() {
  const { data } = useMe();
  const router = useRouter();
  useEffect(() => {
    if (data && data.business?.onboardingStep !== "done") router.replace("/onboarding");
  }, [data, router]);
  return null;
}
