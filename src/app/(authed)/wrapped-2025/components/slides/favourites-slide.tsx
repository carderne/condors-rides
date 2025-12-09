import { Coffee, ExternalLink, Heart, Map } from "lucide-react";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function FavouritesSlide({ data }: { data: WrappedData }) {
  if (!data.favouriteRoute && !data.favouriteCafe) return null;
  return (
    <SlideWrapper gradient="from-rose-500 via-pink-500 to-fuchsia-600">
      <Heart className="h-16 w-16 animate-pulse text-red-200" />
      <h2 className="mt-4 text-2xl font-semibold">Your Favourites</h2>
      <div className="mt-8 flex w-full max-w-md flex-col gap-4">
        {data.favouriteRoute && (
          <div className="rounded-2xl bg-white/20 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <Map className="h-8 w-8 shrink-0 text-yellow-300" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/70">Favourite Route</p>
                <p className="truncate text-xl font-bold">{data.favouriteRoute.name}</p>
                <p className="text-sm text-white/70">Ridden {data.favouriteRoute.count} times</p>
                <a
                  href={data.favouriteRoute.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-yellow-200 underline underline-offset-2 hover:text-yellow-100"
                >
                  View route <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
        {data.favouriteCafe && (
          <div className="rounded-2xl bg-white/20 p-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 shrink-0 text-amber-300" />
              <div>
                <p className="text-sm text-white/70">Favourite Cafe Stop</p>
                <p className="text-xl font-bold">{data.favouriteCafe.name}</p>
                <p className="text-sm text-white/70">Visited {data.favouriteCafe.count} times</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SlideWrapper>
  );
}
