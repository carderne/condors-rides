import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function RidingBuddiesSlide({ data }: { data: WrappedData }) {
  if (data.topRidingBuddies.length === 0) return null;
  return (
    <SlideWrapper gradient="from-blue-500 via-indigo-500 to-violet-600">
      <Users className="h-16 w-16" />
      <h2 className="mt-4 text-2xl font-semibold">Your Riding Buddies</h2>
      <p className="mt-2 text-white/70">The people you rode with most</p>
      <div className="mt-8 flex w-full max-w-md flex-col gap-3">
        {data.topRidingBuddies.slice(0, 5).map((buddy, index) => (
          <div
            key={buddy.name}
            className={cn(
              "flex items-center gap-4 rounded-2xl p-4 backdrop-blur",
              index === 0 ? "bg-yellow-400/30 ring-2 ring-yellow-400" : "bg-white/20",
            )}
          >
            <span className="text-2xl font-bold text-white/80">#{index + 1}</span>
            <Avatar className="h-12 w-12 border-2 border-white/50">
              <AvatarImage src={buddy.image ?? undefined} />
              <AvatarFallback className="bg-white/30 text-white">
                {buddy.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{buddy.name}</p>
              <p className="text-sm text-white/70">{buddy.count} rides together</p>
            </div>
            {index === 0 && <span className="text-2xl">🤝</span>}
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}
