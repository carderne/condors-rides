import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { AnimatedNumber } from "../animated-number";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function LongestRideSlide({ data }: { data: WrappedData }) {
  if (!data.longestRide) return null;
  return (
    <SlideWrapper gradient="from-violet-600 via-purple-600 to-indigo-700">
      <TrendingUp className="h-16 w-16 text-yellow-300" />
      <h2 className="mt-4 text-2xl font-semibold text-white/80">Your longest ride was</h2>
      <div className="my-6 text-6xl font-black md:text-8xl">
        <AnimatedNumber value={data.longestRide.distance} suffix=" km" />
      </div>
      <Card className="mt-2 border-none bg-white/20 p-4 text-center text-white backdrop-blur">
        <p className="text-xl font-semibold">{data.longestRide.name}</p>
        <p className="mt-1 text-white/70">{data.longestRide.date}</p>
      </Card>
    </SlideWrapper>
  );
}
