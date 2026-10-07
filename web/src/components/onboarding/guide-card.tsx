import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stand-in for the presenter video in each onboarding step.
 * Pass `videoSrc` once you have your own recorded/AI presenter clips.
 */
export function GuideCard({
  title,
  subtitle,
  chips,
  videoSrc,
  className,
}: {
  title?: string;
  subtitle: string;
  chips: string[];
  videoSrc?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[16/8] w-full overflow-hidden rounded-3xl bg-[radial-gradient(120%_120%_at_30%_20%,#2b8a4a_0%,#0f3d22_55%,#07170e_100%)] shadow-xl", className)}>
      {videoSrc ? (
        <video src={videoSrc} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <div className="absolute -right-10 -top-10 size-56 rounded-full bg-brand-bright/30 blur-3xl animate-float" />
          <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 sm:size-32">
            <Sparkles className="size-10 text-mint sm:size-14" strokeWidth={1.4} />
          </div>
          {chips.map((c, i) => (
            <span
              key={c}
              className="absolute rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-ink shadow-lg animate-float sm:text-xs"
              style={{ left: i % 2 ? undefined : "8%", right: i % 2 ? "8%" : undefined, top: `${18 + Math.floor(i / 2) * 26}%`, animationDelay: `${i * 0.7}s` }}
            >
              {c}
            </span>
          ))}
        </>
      )}
      {title && <p className="absolute inset-x-0 top-4 text-center font-display text-lg font-extrabold text-white drop-shadow sm:text-2xl">{title}</p>}
      <p className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full bg-black/45 px-4 py-1.5 text-center text-sm font-bold text-white backdrop-blur sm:text-base">{subtitle}</p>
    </div>
  );
}
