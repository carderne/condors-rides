import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function WrappedBanner() {
  return (
    <Link
      href="/wrapped-2025"
      className="group relative mb-4 block overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 p-4 text-white shadow-lg transition-all hover:shadow-xl hover:shadow-pink-500/20 md:p-5"
    >
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-yellow-400/20 blur-xl" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm md:h-14 md:w-14 md:text-3xl">
            🚴
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold md:text-xl">Your 2025 Wrapped</h3>
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </div>
            <p className="text-sm text-white/80 md:text-base">
              See your year in rides, stats & more
            </p>
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1 md:h-12 md:w-12">
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </Link>
  );
}
