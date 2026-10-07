import { SessionGate } from "@/components/session-gate";
import { brand } from "@/config/brand";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata = { title: `Set up ${brand.name}` };

export default function OnboardingPage() {
  return (
    <SessionGate>
      <OnboardingFlow />
    </SessionGate>
  );
}
