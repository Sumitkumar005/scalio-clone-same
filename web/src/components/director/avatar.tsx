import { DIRECTOR_NAME } from "@/config/nav";
import { cn } from "@/lib/utils";

/** Illustrated stand-in for the director persona. Replace with your own presenter art. */
export function DirectorAvatar({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full bg-[conic-gradient(from_200deg,#22b04b,#1d7539,#ffb86b,#22b04b)] p-[3px] shadow", className)}
      style={{ width: size, height: size }}
    >
      <span className="grid size-full place-items-center rounded-full bg-mint font-display font-extrabold text-brand" style={{ fontSize: size * 0.42 }}>
        {DIRECTOR_NAME[0]}
      </span>
    </span>
  );
}
