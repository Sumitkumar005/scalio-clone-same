import { z } from "zod";
import { businesses } from "@/lib/db/models";
import { PHOTO_TAGS } from "@/lib/domain";
import { readFile } from "@/lib/server/files";
import { handler, HttpError, requireUser } from "@/lib/server/session";

const LIMITS = { photos: 60, outros: 6 } as const;

/** Attach an uploaded file to the business media library (photos) or brand outros. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const body = z
    .object({ kind: z.enum(["photos", "outros"]), fileId: z.string(), tags: z.array(z.enum(PHOTO_TAGS)).max(PHOTO_TAGS.length).default([]) })
    .parse(await req.json());
  const f = await readFile(user.id, body.fileId); // ownership check
  const item = { fileId: body.fileId, contentType: f.contentType, name: f.filename, tags: body.tags, createdAt: new Date() };
  const res = await businesses().updateOne(
    { userId: user.id, [`${body.kind}.${LIMITS[body.kind] - 1}`]: { $exists: false } },
    { $push: { [body.kind]: item } },
  );
  if (!res.matchedCount) throw new HttpError(409, `You can keep up to ${LIMITS[body.kind]} ${body.kind}. Remove one first.`);
  return Response.json({ item }, { status: 201 });
});
