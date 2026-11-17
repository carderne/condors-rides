import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function WrappedBanner() {
  return (
    <Link
      href="/wrapped-2026"
      className="group mb-4 flex items-center justify-between gap-4 rounded-xl border-2 border-[#141414] bg-[#d9f24a] p-4 text-[#141414] shadow-[4px_4px_0_#141414] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#141414]"
    >
      <div className="flex items-center gap-4">
        <span className="rounded-md bg-[#141414] px-2 py-1 text-2xl font-black tracking-tighter text-[#d9f24a] tabular-nums">
          ’26
        </span>
        <div>
          <p className="text-lg leading-tight font-bold tracking-tight">Condors Wrapped is here</p>
          <p className="font-mono text-xs tracking-wider uppercase opacity-70">
            Your year in rides, crews &amp; cafés
          </p>
        </div>
      </div>
      <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
