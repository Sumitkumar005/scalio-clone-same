import type { CalendarPrefs, PostFormat, PostStatus } from "@/lib/domain";

export type PostDTO = {
  _id: string;
  date: string;
  time?: string;
  format: PostFormat;
  status: PostStatus;
  title: string;
  subtitle?: string;
  caption: string;
  hashtags: string[];
  theme: string;
  festival?: string;
  palette: number;
  updatedAt: string;
};

export type CalendarResponse = {
  month: string;
  posts: PostDTO[];
  festivals: { date: string; name: string }[];
  counts: { all: number; ready: number; draft: number; needs_attention: number; published: number };
  prefs: CalendarPrefs;
  business: { name: string; logoUrl?: string; brandColor?: string } | null;
};

export const STATUS_META: Record<PostStatus, { label: string; dot: string; ring?: string }> = {
  draft: { label: "Drafted", dot: "bg-slate-400" },
  ready: { label: "Ready", dot: "bg-sky-500" },
  scheduled: { label: "Scheduled", dot: "bg-violet-500" },
  published: { label: "Published", dot: "bg-brand-bright", ring: "ring-2 ring-brand-bright" },
  needs_attention: { label: "Needs attention", dot: "bg-amber-500" },
};

export const imageUrl = (p: PostDTO) => `/api/calendar/posts/${p._id}/image?v=${encodeURIComponent(p.updatedAt)}`;

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Monday-first 6-week grid for a month. */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
