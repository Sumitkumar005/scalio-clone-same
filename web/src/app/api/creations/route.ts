import { creations, posts, threads } from "@/lib/db/models";
import { handler, requireUser } from "@/lib/server/session";
import { fileUrl } from "@/lib/server/files";

const SOURCE_LABEL: Record<string, string> = {
  fashion_photoshoot: "Fashion Studio",
  marketplace_pack: "Marketplace Pack",
  image_studio: "Image Studio",
  calendar: "Calendar",
  director: "Video Director",
};

export type LibraryItem = {
  id: string;
  type: "creation" | "post" | "reel";
  kind: "image" | "video";
  source: string;
  title: string;
  status: string;
  cover?: string;
  outputs: { url: string; label: string; preview?: boolean }[];
  href: string;
  flagged?: boolean;
  createdAt: string;
};

/** One feed across every studio: studio jobs, calendar creatives that are ready, finished reel plans. */
export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const filter = new URL(req.url).searchParams.get("kind"); // image | video | null
  const [jobs, readyPosts, reels] = await Promise.all([
    filter === "video" ? [] : creations().find({ userId: user.id }).sort({ createdAt: -1 }).limit(60).toArray(),
    filter === "video" ? [] : posts().find({ userId: user.id, status: { $in: ["ready", "scheduled", "published"] } }).sort({ updatedAt: -1 }).limit(60).toArray(),
    filter === "image" ? [] : threads().find({ userId: user.id, status: "ready" }, { projection: { messages: 0 } }).sort({ updatedAt: -1 }).limit(60).toArray(),
  ]);

  const items: LibraryItem[] = [
    ...jobs.map((c) => ({
      id: c._id.toString(),
      type: "creation" as const,
      kind: c.kind,
      source: SOURCE_LABEL[c.source] ?? c.source,
      title: c.title,
      status: c.status,
      cover: c.outputs[0] ? fileUrl(c.outputs[0].fileId) : c.inputFileId ? fileUrl(c.inputFileId) : undefined,
      outputs: c.outputs.map((o) => ({ url: fileUrl(o.fileId), label: o.label, preview: o.preview })),
      href: `/studio/result/${c._id}`,
      flagged: c.flagged,
      createdAt: c.createdAt.toISOString(),
    })),
    ...readyPosts.map((p) => ({
      id: p._id.toString(),
      type: "post" as const,
      kind: "image" as const,
      source: SOURCE_LABEL.calendar,
      title: p.title,
      status: p.status === "published" ? "published" : "ready",
      cover: `/api/calendar/posts/${p._id}/image`,
      outputs: [],
      href: `/calendar?date=${p.date}&post=${p._id}`,
      createdAt: p.updatedAt.toISOString(),
    })),
    ...reels.map((t) => ({
      id: t._id.toString(),
      type: "reel" as const,
      kind: "video" as const,
      source: SOURCE_LABEL.director,
      title: t.title,
      status: "ready",
      outputs: [],
      href: `/director?thread=${t._id}`,
      createdAt: t.updatedAt.toISOString(),
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return Response.json({ items });
});
