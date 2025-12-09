import { Trophy } from "lucide-react";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function RankSlide({ data }: { data: WrappedData }) {
  return (
    <SlideWrapper gradient="from-pink-600 via-rose-500 to-red-500">
      <Trophy className="h-16 w-16 text-yellow-300" />
      <h2 className="mt-4 text-2xl font-semibold">Club Rankings</h2>
      <div className="my-6 text-center">
        <div className="text-6xl font-black md:text-8xl">#{data.rank.position}</div>
        <p className="mt-2 text-white/70">out of {data.rank.total} riders</p>
      </div>
      <div className="rounded-2xl bg-white/20 px-8 py-4 backdrop-blur">
        <p className="text-center text-lg">
          You&apos;re in the top <span className="font-bold">{data.rank.percentile}%</span> of
          active riders!
        </p>
      </div>
    </SlideWrapper>
  );
}
