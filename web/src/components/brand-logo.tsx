import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span
      className={cn(
        "font-display text-3xl font-extrabold tracking-tight lowercase",
        light ? "text-white" : "text-brand",
        className,
      )}
    >
      {brand.name}
      <span className={cn("ml-0.5 align-super text-base", light ? "text-mint" : "text-brand-bright")}>✦</span>
    </span>
  );
}
