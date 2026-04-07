import { Button } from "@/components/ui/button";
import type { User } from "@/db/zod";
import { checkIsSuper } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { StarIcon, ThumbsUpIcon, XIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { togglePromoteRouteAction, toggleUpvoteRouteAction } from "./actions";
import type { RouteHydrated } from "./utils";

export function RouteInfoPanel({
  route,
  user,
  onClose,
  onUpdate,
}: {
  route: RouteHydrated;
  user: User | null;
  onClose: () => void;
  onUpdate: (route: RouteHydrated) => void;
}) {
  const isSuper = user ? checkIsSuper(user) : false;

  return (
    <div className="absolute bottom-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white/95 p-4 shadow-lg">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link
          href={route.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          <h3 className="leading-tight font-semibold">{route.name}</h3>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 hover:bg-gray-100"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm">
        <span className="text-muted-foreground">Surface</span>
        <span className="capitalize">{route.surface}</span>
        <span className="text-muted-foreground">Distance</span>
        <span>{route.distance} km</span>
        {route.elevation != null && (
          <>
            <span className="text-muted-foreground">Elevation</span>
            <span>{route.elevation} m</span>
          </>
        )}
        {route.direction && (
          <>
            <span className="text-muted-foreground">Direction</span>
            <span>{route.direction}</span>
          </>
        )}
        {route.cafeStop && (
          <>
            <span className="text-muted-foreground">Cafe stop</span>
            <span className="max-w-[20ch] truncate">{route.cafeStop}</span>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {user && (
            <Button size="sm" asChild>
              <Link href={`/manage/from-route/${route.id}`}>Ride it</Link>
            </Button>
          )}
          {isSuper && (
            <Button size="sm" asChild>
              <Link href={`/map/${route.id}`}>Edit</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSuper ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await togglePromoteRouteAction(route.id);
                onUpdate({ ...route, promoted: !route.promoted });
              }}
            >
              <StarIcon
                className={cn("size-4", route.promoted && "fill-yellow-500 text-yellow-500")}
              />
            </Button>
          ) : (
            route.promoted && <StarIcon className="size-4 fill-yellow-500 text-yellow-500" />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={user === null || route.userVoted === undefined}
            onClick={async () => {
              await toggleUpvoteRouteAction(route.id);
              onUpdate({
                ...route,
                userVoted: !route.userVoted,
                numVotes: route.userVoted ? route.numVotes - 1 : route.numVotes + 1,
              });
            }}
          >
            <ThumbsUpIcon className={cn("size-4", route.userVoted && "text-primary")} />
            <span className="text-xs">{route.numVotes > 0 ? route.numVotes : ""}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
