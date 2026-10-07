import { after } from "next/server";
import { z } from "zod";
import { creations } from "@/lib/db/models";
import { MARKETPLACES, MODELS, POSES, SCENES, type MarketplaceId } from "@/lib/domain";
import { chargeCredits } from "@/lib/server/credits";
import { readFile } from "@/lib/server/files";
import { handler, requireUser } from "@/lib/server/session";
import { creationTitle, runCreation, type PackParams, type PhotoshootParams } from "@/lib/server/studio";

export const maxDuration = 300;

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((x) => x.id) as [T["id"], ...T["id"][]];

const Body = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("photoshoot"),
    inputFileId: z.string(),
    modelId: z.enum(ids(MODELS)),
    poseId: z.enum(ids(POSES)),
    sceneId: z.enum(ids(SCENES)),
    styling: z.string().trim().max(300).default(""),
    count: z.number().int().min(1).max(4).default(2),
    ratio: z.enum(["3:4", "1:1", "9:16"]).default("3:4"),
  }),
  z.object({
    kind: z.literal("pack"),
    inputFileId: z.string(),
    modelId: z.enum(ids(MODELS)),
    marketplaces: z.array(z.enum(ids(MARKETPLACES) as [MarketplaceId, ...MarketplaceId[]])).min(1),
  }),
]);

const COST_PER_IMAGE = 1;

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const body = Body.parse(await req.json());
  await readFile(user.id, body.inputFileId); // ownership + existence check
  const params: PhotoshootParams | PackParams =
    body.kind === "photoshoot"
      ? { kind: "photoshoot", modelId: body.modelId, poseId: body.poseId, sceneId: body.sceneId, styling: body.styling, count: body.count, ratio: body.ratio }
      : { kind: "pack", modelId: body.modelId, marketplaces: body.marketplaces };
  const cost = (body.kind === "pack" ? 4 : body.count) * COST_PER_IMAGE;
  const now = new Date();

  const id = await chargeCredits(user.id, cost, `studio:${body.kind}`, async (session) => {
    const { insertedId } = await creations().insertOne(
      {
        userId: user.id,
        source: body.kind === "pack" ? "marketplace_pack" : "fashion_photoshoot",
        kind: "image",
        title: creationTitle(params),
        status: "queued",
        inputFileId: body.inputFileId,
        params,
        outputs: [],
        creditsCharged: cost,
        createdAt: now,
        updatedAt: now,
      },
      { session },
    );
    return insertedId;
  });

  after(() => runCreation(id));
  return Response.json({ id: id.toString(), cost }, { status: 202 });
});
