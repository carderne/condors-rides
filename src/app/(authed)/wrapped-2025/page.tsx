"use client";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getWrappedDataAction } from "./actions";
import {
  BiggestGroupSlide,
  DistanceSlide,
  FavouriteLeaderSlide,
  FavouritesSlide,
  IntroSlide,
  LongestRideSlide,
  MostActiveMonthSlide,
  RankSlide,
  RidesOverviewSlide,
  RidingBuddiesSlide,
  SummarySlide,
  SurfaceBreakdownSlide,
} from "./components/slides";
import type { WrappedData } from "./components/types";

export default function WrappedPage() {
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWrappedDataAction()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const slides = data
    ? [
        <IntroSlide key="intro" data={data} />,
        <RidesOverviewSlide key="rides" data={data} />,
        data.totalKm > 0 ? <DistanceSlide key="distance" data={data} /> : null,
        data.longestRide ? <LongestRideSlide key="longest" data={data} /> : null,
        data.biggestGroup ? <BiggestGroupSlide key="biggest" data={data} /> : null,
        data.favouriteRoute || data.favouriteCafe ? (
          <FavouritesSlide key="favourites" data={data} />
        ) : null,
        data.topRidingBuddies.length > 0 ? <RidingBuddiesSlide key="buddies" data={data} /> : null,
        data.favouriteLeader ? <FavouriteLeaderSlide key="leader" data={data} /> : null,
        <SurfaceBreakdownSlide key="surface" data={data} />,
        data.mostActiveMonth ? <MostActiveMonthSlide key="month" data={data} /> : null,
        <RankSlide key="rank" data={data} />,
        <SummarySlide key="summary" data={data} />,
      ].filter(Boolean)
    : [];

  const goNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((s) => s + 1);
    }
  }, [currentSlide, slides.length]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((s) => s - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Touch swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart(touch.clientX);
    }
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const touchEnd = touch.clientX;
      const diff = touchStart - touchEnd;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
      setTouchStart(null);
    },
    [touchStart, goNext, goPrev],
  );

  if (loading) {
    return (
      <Container className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-bounce text-6xl">🚴</div>
          <p className="text-muted-foreground text-lg">Loading your 2025 wrapped...</p>
        </div>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">😢</div>
          <p className="text-destructive text-lg">{error || "Something went wrong"}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="pb-8">
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={currentSlide} className="animate-in fade-in slide-in-from-right-4 duration-300">
          {slides[currentSlide]}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="h-12 w-12 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentSlide
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goNext}
            disabled={currentSlide === slides.length - 1}
            className="h-12 w-12 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Hint */}
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Use arrow keys or swipe to navigate
        </p>
      </div>
    </Container>
  );
}
