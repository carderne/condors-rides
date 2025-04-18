import { getConfig } from "@/lib/config";

const { stravaToken } = getConfig();

type Position = [number, number][];

export interface LineString {
  type: "LineString";
  coordinates: Position[];
}

export type GeoJson = LineString;

interface StravaRoute {
  map: { polyline: string };
}

type GetStravaResponse = { success: true; data: StravaRoute } | { success: false; error: string };

export async function getStravaRoute(routeId: string): Promise<GetStravaResponse> {
  const response = await fetch(`https://www.strava.com/api/v3/routes/${routeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${stravaToken}`,
    },
  });

  if (!response.ok) {
    return { success: false, error: "Strava request failed" };
  }

  const data = (await response.json()) as StravaRoute;
  return { success: true, data };
}
