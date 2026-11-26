"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WrappedData } from "../data";
import {
  BigDaysSlide,
  CalendarSlide,
  ClockSlide,
  ClubSlide,
  CrewSlide,
  DistanceSlide,
  EmptySlide,
  IntroSlide,
  LeaderSlide,
  PlacesSlide,
  PlannerSlide,
  RidesSlide,
  SummarySlide,
  VirtualSlide,
} from "./slides";

const SLIDE_MS = 7000;
const TAP_MS = 250;

type SlideComponent = (props: { data: WrappedData; index: number }) => React.JSX.Element;

function buildSlides(data: WrappedData): SlideComponent[] {
  if (data.rides === 0) {
    return [IntroSlide, EmptySlide, data.virtual && VirtualSlide].filter(
      (s): s is SlideComponent => !!s,
    );
  }
  const { places } = data;
  return [
    IntroSlide,
    RidesSlide,
    data.totalKm > 0 && DistanceSlide,
    CalendarSlide,
    data.clock && ClockSlide,
    data.planner && PlannerSlide,
    data.crew.peopleMet > 0 && CrewSlide,
    (places.cafe || places.start || places.route) && PlacesSlide,
    data.virtual && VirtualSlide,
    (data.longest || data.biggest) && BigDaysSlide,
    data.ridesLed > 0 && LeaderSlide,
    ClubSlide,
    SummarySlide,
  ].filter((s): s is SlideComponent => !!s);
}

export function Story({ data }: { data: WrappedData }) {
  const slides = buildSlides(data);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const pressedAt = useRef(0);
  const isLast = current === slides.length - 1;

  const go = useCallback(
    (delta: number) => setCurrent((c) => Math.min(slides.length - 1, Math.max(0, c + delta))),
    [slides.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Hold to pause, tap left third to go back, tap elsewhere to go forward.
  const onPointerDown = () => {
    pressedAt.current = Date.now();
    setPaused(true);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setPaused(false);
    if (Date.now() - pressedAt.current > TAP_MS) return;
    const rect = e.currentTarget.getBoundingClientRect();
    go(e.clientX - rect.left < rect.width / 3 ? -1 : 1);
  };

  const Current = slides[current]!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b]">
      <style>{`
        @keyframes wrapped-rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
        @keyframes wrapped-pop { from { opacity: 0; transform: scale(.4) } to { opacity: 1; transform: none } }
        @keyframes wrapped-slide { from { left: 0% } }
        @keyframes wrapped-grow { from { width: 0% } }
        @keyframes wrapped-progress { from { width: 0% } to { width: 100% } }
      `}</style>
      <div className="relative h-full w-full overflow-hidden select-none sm:h-[min(860px,94vh)] sm:max-w-[440px] sm:rounded-3xl sm:shadow-2xl">
        {/* Progress segments */}
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30 mix-blend-difference"
            >
              {i < current && <div className="h-full w-full bg-white" />}
              {i === current && (
                <div
                  key={current}
                  className="h-full bg-white"
                  onAnimationEnd={() => go(1)}
                  style={{
                    animation: isLast ? "none" : `wrapped-progress ${SLIDE_MS}ms linear both`,
                    animationPlayState: paused ? "paused" : "running",
                    width: isLast ? "100%" : undefined,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <Link
          href="/rides"
          aria-label="Close"
          className="absolute top-6 right-3 z-30 rounded-full p-2 text-white mix-blend-difference"
        >
          <X className="h-5 w-5" />
        </Link>

        <div
          className="h-full w-full touch-manipulation"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setPaused(false)}
        >
          <Current key={current} data={data} index={current} />
        </div>
      </div>
    </div>
  );
}
