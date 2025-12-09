import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function SurfaceBreakdownSlide({ data }: { data: WrappedData }) {
  const total =
    data.surfaceBreakdown.road + data.surfaceBreakdown.offroad + data.surfaceBreakdown.virtual;
  if (total === 0) return null;

  const roadPct = Math.round((data.surfaceBreakdown.road / total) * 100);
  const offroadPct = Math.round((data.surfaceBreakdown.offroad / total) * 100);
  const virtualPct = Math.round((data.surfaceBreakdown.virtual / total) * 100);

  return (
    <SlideWrapper gradient="from-slate-700 via-slate-600 to-slate-800">
      <h2 className="text-2xl font-semibold">Your Riding Style</h2>
      <div className="mt-8 flex w-full max-w-md flex-col gap-4">
        {data.surfaceBreakdown.road > 0 && (
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-lg">🛣️ Road</span>
              <span className="text-2xl font-bold">{roadPct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gray-300 to-gray-100"
                style={{ width: `${roadPct}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-white/70">{data.surfaceBreakdown.road} rides</p>
          </div>
        )}
        {data.surfaceBreakdown.offroad > 0 && (
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-lg">🌲 Off-road</span>
              <span className="text-2xl font-bold">{offroadPct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                style={{ width: `${offroadPct}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-white/70">{data.surfaceBreakdown.offroad} rides</p>
          </div>
        )}
        {data.surfaceBreakdown.virtual > 0 && (
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-lg">🖥️ Virtual</span>
              <span className="text-2xl font-bold">{virtualPct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${virtualPct}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-white/70">{data.surfaceBreakdown.virtual} rides</p>
          </div>
        )}
      </div>
    </SlideWrapper>
  );
}
