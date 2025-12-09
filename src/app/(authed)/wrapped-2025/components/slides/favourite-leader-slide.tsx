import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function FavouriteLeaderSlide({ data }: { data: WrappedData }) {
  if (!data.favouriteLeader) return null;
  return (
    <SlideWrapper gradient="from-amber-500 via-orange-500 to-red-500">
      <Crown className="h-16 w-16 text-yellow-300" />
      <h2 className="mt-4 text-2xl font-semibold">Your Favourite Leader</h2>
      <div className="mt-8 flex flex-col items-center rounded-2xl bg-white/20 p-8 backdrop-blur">
        <Avatar className="h-24 w-24 border-4 border-yellow-400 shadow-lg">
          <AvatarImage src={data.favouriteLeader.image ?? undefined} />
          <AvatarFallback className="bg-yellow-400/30 text-2xl text-white">
            {data.favouriteLeader.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <p className="mt-4 text-2xl font-bold">{data.favouriteLeader.name}</p>
        <p className="mt-2 text-white/70">
          Led you on <span className="font-bold">{data.favouriteLeader.count}</span> rides
        </p>
      </div>
    </SlideWrapper>
  );
}
