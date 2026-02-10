import { Button } from "@/components/ui/button";
import type { User } from "@/db/zod";
import { checkIsSuper } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, StarIcon, ThumbsUpIcon, XIcon } from "lucide-react";
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
  user: User;
  onClose: () => void;
  onUpdate: (route: RouteHydrated) => void;
}) {
  const isSuper = checkIsSuper(user);

  return (
    <div className="absolute bottom-4 left-4 z-10 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white/95 p-4 shadow-lg">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="leading-tight font-semibold">{route.name}</h3>
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

      <div className="mt-3 flex items-center gap-1">
        <Link
          href={route.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
        >
          View route <ExternalLinkIcon className="size-3" />
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {isSuper ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
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
            disabled={route.userVoted === undefined}
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
          </Button>
        </div>
      </div>
    </div>
  );
}
