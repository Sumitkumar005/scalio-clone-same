import { ObjectId } from "mongodb";
import { creations } from "@/lib/db/models";
import { MARKETPLACES, MODELS, PACK_POSES, POSES, SCENES, type Creation, type CreationOutput, type MarketplaceId } from "@/lib/domain";
import { refundCredits } from "./credits";
import { readFile, saveFile } from "./files";
import { generateImage } from "./image-gen";

const TW: Record<string, [string, string]> = {
  palace: ["#fde68a", "#fda4af"],
  studio: ["#f1f5f9", "#cbd5e1"],
  lake: ["#fdba74", "#c084fc"],
  street: ["#bae6fd", "#94a3b8"],
  festive: ["#fef08a", "#fb923c"],
  garden: ["#d9f99d", "#34d399"],
};

export type PhotoshootParams = { kind: "photoshoot"; modelId: string; poseId: string; sceneId: string; styling: string; count: number; ratio: "3:4" | "1:1" | "9:16" };
export type PackParams = { kind: "pack"; marketplaces: MarketplaceId[]; modelId: string };

const RATIO: Record<PhotoshootParams["ratio"], [number, number]> = { "3:4": [1080, 1440], "1:1": [1080, 1080], "9:16": [1080, 1920] };

/** Jobs to render, one per output image. */
export function planOutputs(p: PhotoshootParams | PackParams) {
  const model = MODELS.find((m) => m.id === p.modelId) ?? MODELS[0];
  if (p.kind === "photoshoot") {
    const pose = POSES.find((x) => x.id === p.poseId) ?? POSES[0];
    const scene = SCENES.find((x) => x.id === p.sceneId) ?? SCENES[0];
    const [w, h] = RATIO[p.ratio];
    return Array.from({ length: p.count }, (_, i) => ({
      label: `${model.name} · ${pose.label}${p.count > 1 ? ` · ${i + 1}` : ""}`,
      width: w,
      height: h,
      colors: TW[scene.id],
      prompt: `Professional fashion photoshoot. The exact garment from the reference photo worn by an Indian model (${model.desc}). Pose: ${pose.label}. Setting: ${scene.label}. ${p.styling ? `Styling: ${p.styling}.` : ""} Keep the garment's colour, print, fabric texture and drape identical to the reference. Natural light, sharp focus, full outfit visible, photorealistic, catalogue quality. Variation ${i + 1}.`,
    }));
  }
  // Pack: four standard poses, rendered at the largest size any chosen marketplace needs.
  const chosen = MARKETPLACES.filter((m) => p.marketplaces.includes(m.id));
  const square = chosen.length > 0 && chosen.every((m) => m.ratio === "1:1");
  const [w, h] = square ? [2000, 2000] : [1080, 1440];
  return PACK_POSES.map((pose) => ({
    label: pose,
    width: w,
    height: h,
    colors: TW.studio,
    prompt: `E-commerce catalogue photo. The exact garment from the reference photo worn by an Indian model (${model.desc}). ${pose}. Plain light grey studio background, soft even lighting, whole garment in frame, no props, photorealistic. Keep colour, print and fabric identical to the reference.`,
  }));
}

/** Runs after the HTTP response (see `after()` in the route). Move to a queue (Inngest/Trigger.dev) at scale. */
export async function runCreation(id: ObjectId) {
  const job = await creations().findOneAndUpdate({ _id: id, status: "queued" }, { $set: { status: "processing", updatedAt: new Date() } }, { returnDocument: "after" });
  if (!job) return;
  try {
    const input = await readFile(job.userId, job.inputFileId!);
    const plan = planOutputs(job.params as PhotoshootParams | PackParams);
    const outputs: CreationOutput[] = [];
    for (const o of plan) {
      const img = await generateImage({ prompt: o.prompt, input: { data: input.data, contentType: input.contentType }, width: o.width, height: o.height, sceneColors: o.colors, label: o.label });
      const fileId = await saveFile(job.userId, img.data, img.contentType, `${o.label}.${img.contentType.includes("svg") ? "svg" : "jpg"}`, { creationId: id.toString() });
      outputs.push({ fileId, label: o.label, width: img.width, height: img.height, preview: img.preview });
      await creations().updateOne({ _id: id }, { $set: { outputs, updatedAt: new Date() } });
    }
    await creations().updateOne({ _id: id }, { $set: { status: "ready", updatedAt: new Date() } });
  } catch (e) {
    console.error("[studio] job failed", id.toString(), e);
    await creations().updateOne({ _id: id }, { $set: { status: "failed", error: e instanceof Error ? e.message : "Failed", updatedAt: new Date() } });
    await refundCredits(job.userId, job.creditsCharged, `refund:${id.toString()}`);
  }
}

export function creationTitle(p: PhotoshootParams | PackParams) {
  if (p.kind === "pack") return `Marketplace pack · ${p.marketplaces.map((m) => MARKETPLACES.find((x) => x.id === m)?.label).join(", ")}`;
  const scene = SCENES.find((s) => s.id === p.sceneId)?.label ?? "Photoshoot";
  return `Photoshoot · ${scene}`;
}

export type { Creation };
