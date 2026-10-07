"use client";

import { ImagePlus, Loader2, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Uploaded = { id: string; url: string };

/** Garment / product photo uploader. Files are stored in MongoDB GridFS via /api/files. */
export function Uploader({ value, onChange, className }: { value: Uploaded | null; onChange: (u: Uploaded | null) => void; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/files", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Upload failed");
    onChange(data);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
        className={cn(
          "relative grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-3xl border-2 border-dashed bg-white transition",
          drag ? "border-brand bg-mint" : "border-line hover:border-brand/50",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="Your garment" className="size-full object-contain p-3" />
        ) : (
          <span className="flex flex-col items-center gap-2 p-6 text-center">
            {busy ? <Loader2 className="size-10 animate-spin text-brand" /> : <ImagePlus className="size-10 text-brand" strokeWidth={1.5} />}
            <span className="font-semibold">Upload your garment</span>
            <span className="text-sm text-muted">Flat lay or on a hanger. JPG, PNG or WebP, up to 8 MB.</span>
          </span>
        )}
        {value && (
          <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            <RefreshCw className="size-3" /> Replace
          </span>
        )}
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
