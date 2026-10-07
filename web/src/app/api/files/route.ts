import { handler, HttpError, requireUser } from "@/lib/server/session";
import { MAX_UPLOAD_BYTES, MAX_VIDEO_BYTES, saveFile, sniffImageType, sniffVideoType } from "@/lib/server/files";

/** Upload a photo (JPEG/PNG/WebP, 8 MB) or, with ?video=1, a short clip (MP4/WebM, 30 MB). */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const allowVideo = new URL(req.url).searchParams.get("video") === "1";
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Attach a file");
  if (file.size > (allowVideo ? MAX_VIDEO_BYTES : MAX_UPLOAD_BYTES)) throw new HttpError(413, allowVideo ? "Max 30 MB" : "Max 8 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes) ?? (allowVideo ? sniffVideoType(bytes) : null);
  if (!type) throw new HttpError(415, allowVideo ? "Use a JPG, PNG, WebP, MP4 or WebM file" : "Use a JPG, PNG or WebP photo");
  const id = await saveFile(user.id, bytes, type, file.name.slice(0, 100) || "upload", { kind: "upload" });
  return Response.json({ id, url: `/api/files/${id}`, contentType: type, name: file.name.slice(0, 100) }, { status: 201 });
});
