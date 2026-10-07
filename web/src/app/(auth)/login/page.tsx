import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { LoginScreen } from "./login-screen";

export const metadata: Metadata = { title: `Sign in to ${brand.name} | AI Marketing` };

export default function LoginPage() {
  return <LoginScreen />;
}
