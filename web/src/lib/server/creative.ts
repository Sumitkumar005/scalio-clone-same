/**
 * Renders on-brand post creatives as SVG (no image model needed).
 * Swap for generated imagery later; the layout system stays the same.
 */
export const CREATIVE_PALETTES = [
  { bg1: "#0b5ed7", bg2: "#06306e", accent: "#ffd23f", text: "#ffffff" },
  { bg1: "#1d7539", bg2: "#0a3a1c", accent: "#b9f6ca", text: "#ffffff" },
  { bg1: "#ff6525", bg2: "#a8320a", accent: "#ffe8d6", text: "#ffffff" },
  { bg1: "#6d28d9", bg2: "#2e1065", accent: "#f0abfc", text: "#ffffff" },
  { bg1: "#fef3c7", bg2: "#fcd34d", accent: "#b45309", text: "#3b2306" },
  { bg1: "#e0f2fe", bg2: "#7dd3fc", accent: "#0c4a6e", text: "#082f49" },
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function wrap(text: string, maxChars: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

export function renderPostSvg(p: { title: string; subtitle?: string; brand: string; badge?: string; palette: number; width?: number; height?: number }) {
  const W = p.width ?? 1080;
  const H = p.height ?? 1350;
  const c = CREATIVE_PALETTES[p.palette % CREATIVE_PALETTES.length];
  const titleLines = wrap(p.title, 16, 4);
  const subLines = wrap(p.subtitle ?? "", 34, 3);
  const titleSize = titleLines.length > 3 ? 92 : 112;
  const titleY = H * 0.42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg1}"/><stop offset="1" stop-color="${c.bg2}"/></linearGradient>
    <radialGradient id="r" cx="0.85" cy="0.1" r="0.6"><stop offset="0" stop-color="${c.accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#r)"/>
  <circle cx="${W * 0.88}" cy="${H * 0.82}" r="${W * 0.32}" fill="${c.accent}" opacity="0.12"/>
  <circle cx="${W * 0.1}" cy="${H * 0.95}" r="${W * 0.18}" fill="${c.accent}" opacity="0.10"/>
  <g font-family="Hanken Grotesk, Figtree, Arial, sans-serif" fill="${c.text}">
    <rect x="72" y="72" width="${Math.min(W - 144, 40 + p.brand.length * 26)}" height="76" rx="38" fill="${c.text}" opacity="0.14"/>
    <text x="108" y="122" font-size="38" font-weight="700">${esc(p.brand)}</text>
    ${p.badge ? `<rect x="72" y="${titleY - titleSize - 70}" width="${40 + p.badge.length * 20}" height="58" rx="29" fill="${c.accent}"/><text x="92" y="${titleY - titleSize - 30}" font-size="30" font-weight="800" fill="${c.bg2}">${esc(p.badge)}</text>` : ""}
    ${titleLines.map((l, i) => `<text x="72" y="${titleY + i * (titleSize * 1.05)}" font-size="${titleSize}" font-weight="800" letter-spacing="-2">${esc(l)}</text>`).join("\n    ")}
    ${subLines.map((l, i) => `<text x="72" y="${titleY + titleLines.length * titleSize * 1.05 + 40 + i * 50}" font-size="40" font-weight="500" opacity="0.88">${esc(l)}</text>`).join("\n    ")}
    <rect x="72" y="${H - 170}" width="300" height="88" rx="44" fill="${c.accent}"/>
    <text x="222" y="${H - 113}" font-size="34" font-weight="800" fill="${c.bg2}" text-anchor="middle">Know more →</text>
  </g>
</svg>`;
}
