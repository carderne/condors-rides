import { Crown, Trophy } from "lucide-react";
import { AnimatedNumber } from "../animated-number";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function RidesOverviewSlide({ data }: { data: WrappedData }) {
  return (
    <SlideWrapper gradient="from-emerald-500 via-teal-500 to-cyan-600">
      <Trophy className="h-16 w-16 text-yellow-300" />
      <h2 className="mt-4 text-2xl font-semibold text-white/80">This year you joined</h2>
      <div className="my-6 text-7xl font-black md:text-9xl">
        <AnimatedNumber value={data.ridesJoined} />
      </div>
      <p className="text-2xl font-semibold">
        {data.ridesJoined === 1 ? "ride" : "rides"} with the club!
      </p>
      {data.ridesLed > 0 && (
        <div className="mt-8 rounded-2xl bg-white/20 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-300" />
            <span className="text-lg">
              You led <span className="font-bold">{data.ridesLed}</span> of those rides
            </span>
          </div>
        </div>
      )}
    </SlideWrapper>
  );
}
