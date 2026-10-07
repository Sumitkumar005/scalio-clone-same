/**
 * Image model adapter. One function, swappable providers.
 *  - FAL_KEY set  -> fal.ai FLUX Kontext (edit the garment photo into a model shot)
 *  - otherwise    -> local preview render (garment on the chosen scene), clearly marked as preview
 */
export type GenRequest = {
  prompt: string;
  input: { data: Buffer; contentType: string };
  width: number;
  height: number;
  sceneColors: [string, string];
  label: string;
};
export type GenResult = { data: Buffer; contentType: string; width: number; height: number; preview: boolean };

export const imageModelConfigured = () => Boolean(process.env.FAL_KEY);

export async function generateImage(req: GenRequest): Promise<GenResult> {
  if (process.env.FAL_KEY) return falKontext(req);
  return previewRender(req);
}

async function falKontext(req: GenRequest): Promise<GenResult> {
  const model = process.env.FAL_IMAGE_MODEL ?? "fal-ai/flux-pro/kontext";
  const dataUri = `data:${req.input.contentType};base64,${req.input.data.toString("base64")}`;
  const res = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${process.env.FAL_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ prompt: req.prompt, image_url: dataUri, aspect_ratio: aspect(req.width, req.height), output_format: "jpeg" }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`Image model error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { images?: { url: string; width?: number; height?: number }[] };
  const img = json.images?.[0];
  if (!img) throw new Error("Image model returned no image");
  const file = await fetch(img.url, { signal: AbortSignal.timeout(60_000) });
  return { data: Buffer.from(await file.arrayBuffer()), contentType: file.headers.get("content-type") ?? "image/jpeg", width: img.width ?? req.width, height: img.height ?? req.height, preview: false };
}

function aspect(w: number, h: number) {
  const r = w / h;
  if (Math.abs(r - 1) < 0.05) return "1:1";
  if (Math.abs(r - 0.75) < 0.05) return "3:4";
  if (Math.abs(r - 0.8) < 0.05) return "4:5";
  return r < 1 ? "9:16" : "16:9";
}

function previewRender(req: GenRequest): GenResult {
  const { width: W, height: H } = req;
  const img = `data:${req.input.contentType};base64,${req.input.data.toString("base64")}`;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${req.sceneColors[0]}"/><stop offset="1" stop-color="${req.sceneColors[1]}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <ellipse cx="${W / 2}" cy="${H * 0.9}" rx="${W * 0.32}" ry="${H * 0.03}" fill="#000" opacity="0.15"/>
  <image href="${img}" xlink:href="${img}" x="${W * 0.14}" y="${H * 0.1}" width="${W * 0.72}" height="${H * 0.78}" preserveAspectRatio="xMidYMid meet"/>
  <g font-family="Arial, sans-serif">
    <rect x="${W * 0.04}" y="${H * 0.04}" width="${W * 0.34}" height="${H * 0.05}" rx="${H * 0.025}" fill="#000" opacity="0.45"/>
    <text x="${W * 0.21}" y="${H * 0.074}" font-size="${H * 0.024}" fill="#fff" text-anchor="middle" font-weight="700">PREVIEW</text>
    <rect x="${W * 0.04}" y="${H * 0.9}" width="${W * 0.92}" height="${H * 0.06}" rx="${H * 0.03}" fill="#fff" opacity="0.85"/>
    <text x="${W / 2}" y="${H * 0.938}" font-size="${H * 0.024}" fill="#0e1a12" text-anchor="middle" font-weight="700">${esc(req.label)}</text>
  </g>
</svg>`;
  return { data: Buffer.from(svg), contentType: "image/svg+xml", width: W, height: H, preview: true };
}
