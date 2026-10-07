import { unstable_rethrow } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ensureIndexes } from "@/lib/db/models";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Every visitor has a session (guest or real). The client creates a guest session on first load. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new HttpError(401, "No session");
  await ensureIndexes();
  return session.user as typeof session.user & { isAnonymous?: boolean | null };
}

/** Wrap a route handler: maps HttpError / zod errors to JSON responses. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      unstable_rethrow(e); // let Next.js handle its own control-flow errors (dynamic rendering, redirects)
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      if (e && typeof e === "object" && "issues" in e) return Response.json({ error: "Invalid input", issues: (e as { issues: unknown }).issues }, { status: 400 });
      console.error(e);
      return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
