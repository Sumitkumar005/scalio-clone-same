import { ObjectId } from "mongodb";
import { Readable } from "node:stream";
import { files } from "@/lib/db/models";
import { HttpError } from "./session";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

/** Trust file bytes, not the browser's content-type. */
export function sniffImageType(buf: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45) return "image/webp";
  return null;
}

/** MP4 / MOV (ISO base media: 'ftyp' at byte 4) and WebM. Used for outros. */
export function sniffVideoType(buf: Uint8Array): "video/mp4" | "video/webm" | null {
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return "video/mp4";
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return "video/webm";
  return null;
}

export async function saveFile(userId: string, data: Uint8Array | string, contentType: string, filename: string, meta: Record<string, unknown> = {}) {
  const id = new ObjectId();
  await new Promise<void>((resolve, reject) => {
    const up = files().openUploadStreamWithId(id, filename, { metadata: { userId, contentType, ...meta } });
    Readable.from([typeof data === "string" ? Buffer.from(data) : Buffer.from(data)]).pipe(up).on("finish", () => resolve()).on("error", reject);
  });
  return id.toString();
}

export async function readFile(userId: string, id: string) {
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  const _id = new ObjectId(id);
  const doc = await files().find({ _id }).next();
  if (!doc || doc.metadata?.userId !== userId) throw new HttpError(404, "Not found");
  const chunks: Buffer[] = [];
  for await (const c of files().openDownloadStream(_id)) chunks.push(c as Buffer);
  return { data: Buffer.concat(chunks), contentType: String(doc.metadata?.contentType ?? "application/octet-stream"), filename: doc.filename };
}

export const fileUrl = (id: string) => `/api/files/${id}`;
