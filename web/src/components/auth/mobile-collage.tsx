import { Camera, Gem, Megaphone, ShoppingBag, Sparkles, Star, Video, Shirt, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TILES = [
  { g: "from-rose-200 to-amber-100", Icon: Gem },
  { g: "from-sky-200 to-indigo-200", Icon: Camera },
  { g: "from-emerald-200 to-lime-100", Icon: Shirt },
  { g: "from-amber-200 to-orange-300", Icon: ShoppingBag },
  { g: "from-teal-300 to-emerald-500", Icon: Video },
  { g: "from-fuchsia-200 to-pink-300", Icon: Flower2 },
  { g: "from-yellow-100 to-amber-300", Icon: Star },
  { g: "from-indigo-200 to-violet-300", Icon: Megaphone },
  { g: "from-pink-400 to-rose-600", Icon: Sparkles },
];

/** Original placeholder collage. Swap tiles for real customer outputs once you have them. */
export function MobileCollage() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-mint">
      <div className="absolute -left-16 top-16 grid w-[150%] grid-cols-3 gap-4 [transform:perspective(900px)_rotateX(8deg)]">
        {TILES.map(({ g, Icon }, i) => (
          <div
            key={i}
            className={cn("grid aspect-[3/4] place-items-center rounded-[2rem] bg-gradient-to-br shadow-lg animate-float", g)}
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            <Icon className="size-10 text-white drop-shadow" strokeWidth={1.5} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/60 to-transparent" />
    </div>
  );
}
