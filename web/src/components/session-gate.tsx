"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

/** No login wall: if the visitor has no session, quietly start a guest one. */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession();
  const started = useRef(false);

  useEffect(() => {
    if (isPending || data || started.current) return;
    started.current = true;
    authClient.signIn.anonymous().then(() => refetch());
  }, [isPending, data, refetch]);

  if (!data) {
    return (
      <div className="grid min-h-dvh place-items-center bg-mint">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }
  return <>{children}</>;
}
