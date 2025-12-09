import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function MostActiveMonthSlide({ data }: { data: WrappedData }) {
  if (!data.mostActiveMonth) return null;
  return (
    <SlideWrapper gradient="from-green-500 via-emerald-500 to-teal-600">
      <span className="text-6xl">📅</span>
      <h2 className="mt-4 text-2xl font-semibold text-white/80">Your most active month was</h2>
      <div className="my-6 text-5xl font-black md:text-7xl">{data.mostActiveMonth.month}</div>
      <p className="text-xl">
        with <span className="font-bold">{data.mostActiveMonth.rides}</span> rides!
      </p>
    </SlideWrapper>
  );
}
