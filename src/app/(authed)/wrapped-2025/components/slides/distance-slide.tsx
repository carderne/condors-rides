import { Mountain, Route } from "lucide-react";
import { AnimatedNumber } from "../animated-number";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function DistanceSlide({ data }: { data: WrappedData }) {
  return (
    <SlideWrapper gradient="from-orange-500 via-amber-500 to-yellow-500">
      <Route className="h-16 w-16" />
      <h2 className="mt-4 text-2xl font-semibold text-white/80">You rode a total of</h2>
      <div className="my-6 text-6xl font-black md:text-8xl">
        <AnimatedNumber value={data.totalKm} suffix=" km" />
      </div>
      <p className="text-lg text-white/80">
        That&apos;s {Math.round((data.totalKm / 40075) * 100 * 10) / 10}% of the way around Earth!
      </p>
      {data.totalElevation > 0 && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-4 backdrop-blur">
          <Mountain className="h-8 w-8" />
          <div>
            <div className="text-3xl font-bold">
              <AnimatedNumber value={data.totalElevation} suffix="m" />
            </div>
            <div className="text-sm text-white/80">
              elevation climbed ({Math.round((data.totalElevation / 8849) * 10) / 10}x Everest!)
            </div>
          </div>
        </div>
      )}
    </SlideWrapper>
  );
}
