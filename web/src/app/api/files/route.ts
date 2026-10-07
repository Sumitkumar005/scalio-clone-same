import { handler, HttpError, requireUser } from "@/lib/server/session";
import { MAX_UPLOAD_BYTES, saveFile, sniffImageType } from "@/lib/server/files";

/** Upload a product / garment photo (JPEG, PNG or WebP, up to 8 MB). */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Attach a file");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Max 8 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) throw new HttpError(415, "Use a JPG, PNG or WebP photo");
  const id = await saveFile(user.id, bytes, type, file.name.slice(0, 100) || "upload", { kind: "upload" });
  return Response.json({ id, url: `/api/files/${id}` }, { status: 201 });
});
