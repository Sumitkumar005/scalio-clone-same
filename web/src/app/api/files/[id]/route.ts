import { readFile } from "@/lib/server/files";
import { handler, requireUser } from "@/lib/server/session";

export const GET = handler(async (req: Request, ctx: RouteContext<"/api/files/[id]">) => {
  const user = await requireUser();
  const f = await readFile(user.id, (await ctx.params).id);
  const download = new URL(req.url).searchParams.has("download");
  const ext = f.contentType.includes("svg") ? "svg" : f.contentType.split("/")[1] ?? "bin";
  return new Response(new Uint8Array(f.data), {
    headers: {
      "content-type": f.contentType,
      "cache-control": "private, max-age=3600",
      "x-content-type-options": "nosniff",
      // SVGs are served same-origin: forbid scripts and external loads.
      "content-security-policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
      ...(download && { "content-disposition": `attachment; filename="kreo-${(await ctx.params).id}.${ext}"` }),
    },
  });
});
