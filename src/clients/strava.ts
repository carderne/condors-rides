import { getConfig } from "@/lib/config";

const { stravaToken } = getConfig();

type Position = [number, number][];

export interface LineString {
  type: "LineString";
  coordinates: Position[];
}

export type GeoJson = LineString;

interface StravaRoute {
  map: {
    polyline: string;
  };
}

export async function getStravaRoute(routeId: string): Promise<StravaRoute> {
  const response = await fetch(`https://www.strava.com/api/v3/routes/${routeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${stravaToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const res = await response.json();
  return res;
}
