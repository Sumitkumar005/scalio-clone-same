"use client";

import { AtSign, Building2, ChevronRight, Film, Globe, ImagePlus, Languages, Link2, Loader2, Palette, Pencil, Phone, Plus, RefreshCw, Shapes, Sparkles, Trash2, Users } from "lucide-react";
import { useRef, useState } from "react";
import { api, useMe, type BusinessDTO } from "@/lib/api";
import { BUSINESS_TYPES, CATEGORIES, CONTENT_LANGUAGES, PHOTO_TAGS, TONE_TAGS, type MediaItem } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { Card, ChipToggle, Field, inputCls, ListEditor, SaveButton, useSaver } from "./ui";

type Media = Omit<MediaItem, "createdAt"> & { createdAt: string };
type B = Omit<BusinessDTO, "photos" | "outros"> & { photos?: Media[]; outros?: Media[] };

export function BusinessSettings() {
  const { data: me, mutate } = useMe();
  if (!me) return <Loader2 className="size-6 animate-spin text-brand" />;
  if (!me.business) return <p className="text-muted">Finish setup first.</p>;
  const b = me.business as B;
  const patch = async (json: Partial<BusinessDTO>) => {
    const { business } = await api<{ business: BusinessDTO }>("/api/business", { method: "PATCH", json });
    await mutate({ ...me, business }, { revalidate: false });
  };
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight">My Business</h1>
        <p className="mt-2 text-muted">This profile shapes every post, ad, video and photoshoot we make for you.</p>
      </header>
      <WebsiteCard b={b} onDone={() => mutate()} />
      <IdentityCard b={b} patch={patch} />
      <CategoryCard b={b} patch={patch} />
      <VoiceCard b={b} patch={patch} />
      <SocialCard b={b} patch={patch} />
      <PhotosCard b={b} onChange={() => mutate()} />
      <BrandAssetsCard b={b} patch={patch} onChange={() => mutate()} />
      <MoreCard b={b} patch={patch} />
    </div>
  );
}

/* ---------- Website ---------- */

function WebsiteCard({ b, onDone }: { b: B; onDone: () => void }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(b.website ?? "");
  const [busy, setBusy] = useState<null | "refresh" | "change" | "check">(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async (kind: "refresh" | "change" | "check", body: Record<string, unknown>) => {
    setBusy(kind);
    setMsg(null);
    try {
      const r = await api<{ source: "ai" | "rules" }>("/api/business/refresh", { method: "POST", json: body });
      setMsg({ ok: true, text: kind === "check" ? "Up to date. We added anything new from your website." : `Updated from your website${r.source === "rules" ? " (basic read, add an AI key for a deeper one)" : ""}.` });
      setEditing(false);
      onDone();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't read the website" });
    }
    setBusy(null);
  };

  return (
    <>
      <button onClick={() => run("check", {})} disabled={!!busy || !b.website} className="flex items-center gap-2 self-start font-semibold text-brand disabled:opacity-50">
        {busy === "check" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Check for updates <ChevronRight className="size-4" />
      </button>
      <Card icon={<Globe className="size-5" />} title="Your website" subtitle="Where we learn what you sell, how you talk and how you look.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className={cn("flex flex-1 items-center gap-2 rounded-2xl border border-line px-4", editing ? "bg-white ring-4 ring-brand/20" : "bg-paper")}>
            <Link2 className="size-4 text-muted" />
            <input value={url} readOnly={!editing} onChange={(e) => setUrl(e.target.value)} placeholder="yourstore.com" className="h-12 flex-1 bg-transparent outline-none" />
          </label>
          {editing ? (
            <>
              <button onClick={() => run("change", { url, overwrite: true })} disabled={!!busy || url.trim().length < 4} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-semibold text-white disabled:opacity-50">
                {busy === "change" && <Loader2 className="size-4 animate-spin" />} Save and read
              </button>
              <button onClick={() => { setEditing(false); setUrl(b.website ?? ""); }} className="h-12 rounded-2xl border border-line px-5 font-semibold">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-brand/40 px-5 font-semibold text-brand hover:bg-mint"><Pencil className="size-4" /> Change</button>
              <button onClick={() => run("refresh", { overwrite: true })} disabled={!!busy || !b.website} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-brand/40 px-5 font-semibold text-brand hover:bg-mint disabled:opacity-50">
                {busy === "refresh" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Refresh
              </button>
            </>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">
          {b.siteSnapshot ? `Last read ${new Date(b.siteSnapshot.fetchedAt as unknown as string).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}. ` : ""}
          Refresh updates your description, tagline and logo from the site. Check for updates only fills empty fields. Your own edits always stay.
        </p>
        {msg && <p className={cn("mt-2 text-sm", msg.ok ? "text-brand" : "text-red-600")}>{msg.text}</p>}
      </Card>
    </>
  );
}

/* ---------- Identity ---------- */

function IdentityCard({ b, patch }: { b: B; patch: (p: Partial<BusinessDTO>) => Promise<void> }) {
  const [f, setF] = useState({ phone: b.phone ?? "", name: b.name, tagline: b.tagline ?? "", city: b.city ?? "", audience: b.audience ?? "", logoUrl: b.logoUrl ?? "" });
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingLogo, setEditingLogo] = useState(false);
  const s = useSaver();
  const logoInput = useRef<HTMLInputElement>(null);
  const [logoBusy, setLogoBusy] = useState(false);

  const uploadLogo = async (file?: File) => {
    if (!file) return;
    setLogoBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/files", { method: "POST", body });
    const data = await res.json();
    setLogoBusy(false);
    if (res.ok) setF((x) => ({ ...x, logoUrl: data.url }));
  };

  return (
    <Card icon={<Building2 className="size-5" />} title="Business identity" subtitle="Logo, name, tagline, location and who you sell to.">
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); s.run(() => patch(f)).then(() => { setEditingPhone(false); setEditingLogo(false); }); }}>
        <Field label="Business contact number" hint="Shown on post images and used in calls to action.">
          {editingPhone || f.phone ? (
            <label className="flex items-center gap-2">
              <Phone className="size-4 text-muted" />
              <input value={f.phone} onChange={(e) => { setF({ ...f, phone: e.target.value }); s.dirty(); }} placeholder="+91 98765 43210" inputMode="tel" className={inputCls} />
            </label>
          ) : (
            <button type="button" onClick={() => setEditingPhone(true)} className="flex w-full items-center justify-between text-left text-sm text-muted">
              No number added yet <Plus className="size-5 text-brand" />
            </button>
          )}
        </Field>

        <div className="rounded-2xl border border-line bg-[#fbfdf4] p-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => logoInput.current?.click()} className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-white" aria-label="Upload logo">
              {logoBusy ? <Loader2 className="size-5 animate-spin text-brand" /> : f.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.logoUrl} alt="Logo" className="size-full object-contain" />
              ) : (
                <span className="font-display text-2xl font-extrabold text-brand">{(f.name || "?")[0]}</span>
              )}
            </button>
            <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { uploadLogo(e.target.files?.[0]); s.dirty(); }} />
            <div className="min-w-0 flex-1">
              {editingLogo ? (
                <div className="grid gap-2">
                  <input value={f.name} onChange={(e) => { setF({ ...f, name: e.target.value }); s.dirty(); }} placeholder="Business name" className={inputCls} required />
                  <input value={f.tagline} onChange={(e) => { setF({ ...f, tagline: e.target.value }); s.dirty(); }} placeholder="Tagline" className={inputCls} />
                </div>
              ) : (
                <>
                  <p className="truncate font-display text-lg font-bold">{f.name}</p>
                  <p className="truncate text-sm text-muted">{f.tagline || "Add a tagline"}</p>
                </>
              )}
            </div>
            {!editingLogo && <button type="button" onClick={() => setEditingLogo(true)} className="rounded-xl border border-brand/40 px-4 py-2 text-sm font-semibold text-brand hover:bg-mint">Edit</button>}
          </div>
          <p className="mt-2 text-xs text-muted">Tap the logo to upload a new one (PNG with transparent background works best).</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Location"><input value={f.city} onChange={(e) => { setF({ ...f, city: e.target.value }); s.dirty(); }} placeholder="City" className={inputCls} /></Field>
          <Field label="Who buys from you?"><input value={f.audience} onChange={(e) => { setF({ ...f, audience: e.target.value }); s.dirty(); }} placeholder="e.g. Students planning a master's abroad" className={inputCls} /></Field>
        </div>
        <Footer s={s} />
      </form>
    </Card>
  );
}

/* ---------- Category ---------- */

function CategoryCard({ b, patch }: { b: B; patch: (p: Partial<BusinessDTO>) => Promise<void> }) {
  const [f, setF] = useState({ category: b.category ?? "", subCategory: b.subCategory ?? "", businessTypes: (b.businessTypes ?? []) as string[] });
  const s = useSaver();
  return (
    <Card icon={<Shapes className="size-5" />} title="Category" subtitle="Decides which templates, ideas and formats we suggest.">
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); s.run(() => patch({ ...f, category: (f.category || undefined) as BusinessDTO["category"], businessTypes: f.businessTypes as BusinessDTO["businessTypes"] })); }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category">
            <select value={f.category} onChange={(e) => { setF({ ...f, category: e.target.value }); s.dirty(); }} className={inputCls}>
              <option value="">Choose one</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Sub category"><input value={f.subCategory} onChange={(e) => { setF({ ...f, subCategory: e.target.value }); s.dirty(); }} placeholder="e.g. Study abroad platform" className={inputCls} /></Field>
        </div>
        <Field label="Type" hint="Pick all that apply.">
          <ChipToggle options={BUSINESS_TYPES} value={f.businessTypes} onChange={(v) => { setF({ ...f, businessTypes: v }); s.dirty(); }} />
        </Field>
        <Footer s={s} />
      </form>
    </Card>
  );
}

/* ---------- Brand voice ---------- */

function VoiceCard({ b, patch }: { b: B; patch: (p: Partial<BusinessDTO>) => Promise<void> }) {
  const [f, setF] = useState({ toneTags: b.toneTags ?? [], usps: b.usps ?? [], offerings: b.offerings ?? [] });
  const s = useSaver();
  return (
    <Card icon={<Sparkles className="size-5" />} title="Brand voice" subtitle="Tone, selling points and services we weave into every prompt.">
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); s.run(() => patch(f)); }}>
        <Field label="Brand tone" hint="Up to 4 works best.">
          <ChipToggle options={TONE_TAGS} value={f.toneTags} onChange={(v) => { setF({ ...f, toneTags: v.slice(0, 8) }); s.dirty(); }} />
        </Field>
        <Field label="What makes you different" hint="Real facts only. We never invent numbers for you.">
          <ListEditor value={f.usps} onChange={(v) => { setF({ ...f, usps: v }); s.dirty(); }} placeholder="e.g. 99% visa success rate" max={12} />
        </Field>
        <Field label="Services and products">
          <ListEditor value={f.offerings} onChange={(v) => { setF({ ...f, offerings: v }); s.dirty(); }} placeholder="e.g. Education loans" max={20} />
        </Field>
        <Footer s={s} />
      </form>
    </Card>
  );
}

/* ---------- Social ---------- */

function SocialCard({ b, patch }: { b: B; patch: (p: Partial<BusinessDTO>) => Promise<void> }) {
  const [handle, setHandle] = useState(b.instagram ?? "");
  const [editing, setEditing] = useState(!b.instagram);
  const s = useSaver();
  return (
    <Card icon={<Users className="size-5" />} title="Social accounts" subtitle="Channels we can post to for you.">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white"><AtSign className="size-6" /></span>
        {editing ? (
          <form className="flex flex-1 flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); s.run(() => patch({ instagram: handle })).then(() => setEditing(false)); }}>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Instagram handle" className={cn(inputCls, "flex-1")} />
            <SaveButton state={s.state} />
          </form>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="font-semibold">@{b.instagram}</p>
            <p className="text-sm text-muted">Handle saved. Direct publishing turns on once our Meta app is approved.</p>
          </div>
        )}
        {!editing && (
          <div className="flex gap-2">
            <button onClick={() => s.run(() => patch({ instagram: "" })).then(() => { setHandle(""); setEditing(true); })} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-red-50 hover:text-red-600">Disconnect</button>
            <button onClick={() => setEditing(true)} className="rounded-xl border border-brand/40 px-4 py-2 text-sm font-semibold text-brand hover:bg-mint">Change</button>
          </div>
        )}
      </div>
      {s.error && <p className="mt-2 text-sm text-red-600">{s.error}</p>}
    </Card>
  );
}

/* ---------- Photos ---------- */

function PhotosCard({ b, onChange }: { b: B; onChange: () => void }) {
  const photos = b.photos ?? [];
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const shown = showAll ? photos : photos.slice(0, 10);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(list).slice(0, 10)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/files", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) { setError(`${file.name}: ${data.error}`); continue; }
      await api("/api/business/media", { method: "POST", json: { kind: "photos", fileId: data.id, tags: ["Social"] } }).catch((e) => setError(e.message));
    }
    setBusy(false);
    onChange();
  };

  return (
    <Card icon={<ImagePlus className="size-5" />} title="Business photos" subtitle="Your real photos keep generated posts and videos looking like your business.">
      <p className="mb-2 font-semibold">Photos <span className="text-sm font-normal text-muted">({photos.length})</span></p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {shown.map((p) => <PhotoTile key={p.fileId} p={p} onChange={onChange} />)}
        <button onClick={() => input.current?.click()} disabled={busy} className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-line text-muted hover:border-brand hover:text-brand">
          {busy ? <Loader2 className="size-6 animate-spin" /> : <span className="flex flex-col items-center gap-1 text-sm font-semibold"><Plus className="size-6" /> Add photos</span>}
        </button>
      </div>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files)} />
      {photos.length > 10 && <button onClick={() => setShowAll((x) => !x)} className="mt-3 text-sm font-semibold text-brand">{showAll ? "Show less" : `See all ${photos.length}`}</button>}
      {!photos.length && <p className="mt-3 text-sm text-muted">Add shop, product and team photos. Tag them so we know where to use each one.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}

function PhotoTile({ p, onChange }: { p: Media; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState(p.tags);
  const save = async (next: string[]) => {
    setTags(next);
    await api(`/api/business/media/${p.fileId}`, { method: "PATCH", json: { tags: next } });
  };
  return (
    <div className="group relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/files/${p.fileId}`} alt={p.name} loading="lazy" className="aspect-square w-full rounded-2xl border border-line object-cover" />
      <button onClick={() => setOpen((o) => !o)} className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
        {tags.length ? tags.join(" · ") : "Add tags"}
      </button>
      <button
        aria-label="Delete photo"
        onClick={async () => { if (!confirm("Remove this photo?")) return; await api(`/api/business/media/${p.fileId}`, { method: "DELETE" }); onChange(); }}
        className="absolute right-2 top-2 hidden size-7 place-items-center rounded-full bg-white/90 text-red-600 shadow group-hover:grid"
      >
        <Trash2 className="size-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-52 rounded-2xl border border-line bg-white p-2 shadow-xl">
          <ChipToggle options={PHOTO_TAGS} value={tags} onChange={save} />
          <button onClick={() => { setOpen(false); onChange(); }} className="mt-2 w-full rounded-xl bg-mint py-1.5 text-sm font-semibold text-brand">Done</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Brand assets ---------- */

function BrandAssetsCard({ b, patch, onChange }: { b: B; patch: (p: Partial<BusinessDTO>) => Promise<void>; onChange: () => void }) {
  const [colors, setColors] = useState<string[]>(b.brandColors?.length ? b.brandColors : []);
  const s = useSaver();
  const outros = b.outros ?? [];
  const outroInput = useRef<HTMLInputElement>(null);
  const [outroBusy, setOutroBusy] = useState(false);
  const [outroErr, setOutroErr] = useState<string | null>(null);

  const addOutro = async (file?: File) => {
    if (!file) return;
    setOutroBusy(true);
    setOutroErr(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/files?video=1", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) setOutroErr(data.error);
    else await api("/api/business/media", { method: "POST", json: { kind: "outros", fileId: data.id } }).catch((e) => setOutroErr(e.message));
    setOutroBusy(false);
    onChange();
  };

  return (
    <Card icon={<Palette className="size-5" />} title="Brand assets" subtitle="Colours and reusable video endings that make everything recognisably yours.">
      <div className="grid gap-3 lg:grid-cols-2">
        <Field label="Colours" hint="Your first colour is used for the “Brand” style on calendar posts.">
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((c, i) => (
              <div key={i} className="group relative">
                <input type="color" value={c} aria-label={`Colour ${i + 1}`} onChange={(e) => { setColors(colors.map((x, j) => (j === i ? e.target.value : x))); s.dirty(); }} className="size-12 cursor-pointer rounded-xl border border-line bg-white p-1" />
                <button type="button" aria-label="Remove colour" onClick={() => { setColors(colors.filter((_, j) => j !== i)); s.dirty(); }} className="absolute -right-1.5 -top-1.5 hidden size-5 place-items-center rounded-full bg-white text-xs shadow group-hover:grid">×</button>
              </div>
            ))}
            {colors.length < 6 && (
              <button type="button" onClick={() => { setColors([...colors, "#1d7539"]); s.dirty(); }} className="grid size-12 place-items-center rounded-xl border-2 border-dashed border-line text-muted hover:border-brand hover:text-brand" aria-label="Add colour"><Plus className="size-5" /></button>
            )}
            <div className="ml-auto"><SaveButton state={s.state} onClick={() => s.run(() => patch({ brandColors: colors.map((c) => c.toLowerCase()) }))} /></div>
          </div>
          {s.error && <p className="mt-2 text-sm text-red-600">{s.error}</p>}
        </Field>
        <Field label="Outros" hint="A 2-5 second ending with your logo, added to the end of videos.">
          <div className="flex flex-wrap gap-3">
            {outros.map((o) => (
              <div key={o.fileId} className="group relative h-20 w-14 overflow-hidden rounded-xl border border-line bg-ink">
                {o.contentType.startsWith("video/") ? (
                  <video src={`/api/files/${o.fileId}`} muted loop playsInline autoPlay className="size-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/files/${o.fileId}`} alt={o.name} className="size-full object-cover" />
                )}
                <button aria-label="Remove outro" onClick={async () => { await api(`/api/business/media/${o.fileId}`, { method: "DELETE" }); onChange(); }} className="absolute right-1 top-1 hidden size-5 place-items-center rounded-full bg-white text-xs text-red-600 group-hover:grid">×</button>
              </div>
            ))}
            {outros.length < 6 && (
              <button type="button" onClick={() => outroInput.current?.click()} className="grid h-20 w-14 place-items-center rounded-xl border-2 border-dashed border-line text-muted hover:border-brand hover:text-brand" aria-label="Add outro">
                {outroBusy ? <Loader2 className="size-4 animate-spin" /> : <Film className="size-5" />}
              </button>
            )}
          </div>
          <input ref={outroInput} type="file" accept="video/mp4,video/webm,image/png,image/jpeg,image/webp" hidden onChange={(e) => addOutro(e.target.files?.[0])} />
          {outroErr && <p className="mt-2 text-sm text-red-600">{outroErr}</p>}
        </Field>
      </div>
    </Card>
  );
}

/* ---------- More ---------- */

function MoreCard({ b, patch }: { b: B; patch: (p: Partial<BusinessDTO>) => Promise<void> }) {
  const [f, setF] = useState({ language: b.language ?? "en", description: b.description ?? "" });
  const s = useSaver();
  return (
    <Card icon={<Languages className="size-5" />} title="More business details" subtitle="Language for generated content and the one-line summary we work from.">
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); s.run(() => patch(f)); }}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Content language">
            <select value={f.language} onChange={(e) => { setF({ ...f, language: e.target.value }); s.dirty(); }} className={inputCls}>
              {CONTENT_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </Field>
          <Field label="About your business"><textarea rows={3} value={f.description} onChange={(e) => { setF({ ...f, description: e.target.value }); s.dirty(); }} className={inputCls} /></Field>
        </div>
        <Footer s={s} />
      </form>
    </Card>
  );
}

function Footer({ s }: { s: ReturnType<typeof useSaver> }) {
  return (
    <div className="flex items-center justify-end gap-3">
      {s.error && <p className="text-sm text-red-600">{s.error}</p>}
      <SaveButton state={s.state} />
    </div>
  );
}
