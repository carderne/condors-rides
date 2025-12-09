import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function SummarySlide({ data }: { data: WrappedData }) {
  return (
    <SlideWrapper gradient="from-pink-600 via-fuchsia-600 to-purple-700">
      <h2 className="text-3xl font-bold md:text-4xl">2025 Summary</h2>
      <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/20 p-4 text-center backdrop-blur">
          <div className="text-3xl font-bold">{data.ridesJoined}</div>
          <div className="text-sm text-white/70">Rides</div>
        </div>
        <div className="rounded-2xl bg-white/20 p-4 text-center backdrop-blur">
          <div className="text-3xl font-bold">{data.totalKm}</div>
          <div className="text-sm text-white/70">Kilometers</div>
        </div>
        <div className="rounded-2xl bg-white/20 p-4 text-center backdrop-blur">
          <div className="text-3xl font-bold">{data.totalElevation}</div>
          <div className="text-sm text-white/70">Meters Climbed</div>
        </div>
        <div className="rounded-2xl bg-white/20 p-4 text-center backdrop-blur">
          <div className="text-3xl font-bold">{data.ridesLed}</div>
          <div className="text-sm text-white/70">Rides Led</div>
        </div>
      </div>
      <p className="mt-8 text-center text-xl">
        Thanks for riding with us, {data.user.name.split(" ")[0]}! 🚴‍♂️
      </p>
      <p className="mt-2 text-white/70">See you on the road in 2026!</p>
    </SlideWrapper>
  );
}
