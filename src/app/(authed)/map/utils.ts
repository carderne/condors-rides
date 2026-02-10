import type { Route } from "@/db/zod";
import type maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type RouteHydrated = Omit<Route, "createdAt" | "updatedAt"> & {
  userVoted?: boolean;
  numVotes: number;
};

export function routesToFeatureCollection(
  routes: RouteHydrated[],
  promotedIds: Set<string>,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: routes
      .filter((r) => r.geojson)
      .map((r) => ({
        type: "Feature" as const,
        properties: {
          routeId: r.id,
          name: r.name,
          surface: r.surface,
          distance: r.distance,
          elevation: r.elevation,
          direction: r.direction,
          cafeStop: r.cafeStop,
          notes: r.notes,
          numVotes: "numVotes" in r ? r.numVotes : 0,
          numRides: "numRides" in r ? r.numRides : 0,
          url: r.url,
          isPromoted: promotedIds.has(r.id),
        },
        geometry: r.geojson!,
      })),
  };
}

export function transformRequest(osKey: string) {
  return (url: string, resourceType: maplibregl.ResourceType | undefined) => {
    if (resourceType !== "Style" && url.startsWith("https://api.os.uk")) {
      const u = new URL(url);
      if (!u.searchParams.has("key")) u.searchParams.append("key", osKey);
      if (!u.searchParams.has("srs")) u.searchParams.append("srs", "3857");
      return { url: new Request(u).url };
    }
  };
}
