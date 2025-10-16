import { getConfig } from "@/lib/config";
import type { Result } from "@/types/result";

const {
  ridewithgps: { apiKey, authToken },
} = getConfig();

interface RideWithGpsRoute {
  route: {
    // https://github.com/ridewithgps/developers/blob/master/reference/track_points.md
    course_points: { x: number; y: number }[];
    track_points: { x: number; y: number }[];
  };
}

type RideWithGpsResponse<T> = Result<T, string>;

export async function getRideWithGpsRoute(
  routeId: string,
): Promise<RideWithGpsResponse<RideWithGpsRoute>> {
  const response = await fetch(`https://ridewithgps.com/api/v1/routes/${routeId}.json`, {
    method: "GET",
    headers: {
      "x-rwgps-api-key": apiKey,
      "x-rwgps-auth-token": authToken,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    console.error("RideWithGps get route failed", data);
    return { ok: false, error: "RideWithGps get route failed" };
  }

  return { ok: true, data };
}

export function convertRouteToLineString(route: RideWithGpsRoute): GeoJSON.LineString {
  const coordinates = route.route.track_points.map(({ x, y }) => [x, y]);
  const linestring = {
    type: "LineString" as const,
    coordinates,
  };
  return linestring;
}
