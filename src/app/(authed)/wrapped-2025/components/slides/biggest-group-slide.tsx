import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AnimatedNumber } from "../animated-number";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function BiggestGroupSlide({ data }: { data: WrappedData }) {
  if (!data.biggestGroup) return null;
  return (
    <SlideWrapper gradient="from-cyan-500 via-blue-500 to-indigo-600">
      <Users className="h-16 w-16 text-yellow-300" />
      <h2 className="mt-4 text-2xl font-semibold text-white/80">Your biggest group ride had</h2>
      <div className="my-6 text-6xl font-black md:text-8xl">
        <AnimatedNumber value={data.biggestGroup.memberCount} />
      </div>
      <p className="text-2xl font-semibold">riders!</p>
      <Card className="mt-6 border-none bg-white/20 p-4 text-center text-white backdrop-blur">
        <p className="text-xl font-semibold">{data.biggestGroup.name}</p>
        <p className="mt-1 text-white/70">{data.biggestGroup.date}</p>
      </Card>
    </SlideWrapper>
  );
}
