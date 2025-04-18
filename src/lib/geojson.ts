import { getStravaRoute } from "@/clients/strava";
import type { Ride } from "@/db/zod";
import { invariant } from "@/lib/invariant";
import polyline from "@mapbox/polyline";

export async function getGeojson(ride: Ride): Promise<GeoJSON.LineString | null> {
  if (ride.route && ride.route.includes("strava.com")) {
    const routeId = ride.route.split("/").at(-1);
    invariant(routeId);
    const stravaResponse = await getStravaRoute(routeId);
    if (!stravaResponse.success) {
      return null;
    }
    const geojson = polyline.toGeoJSON(stravaResponse.data.map.polyline);
    return geojson;
  }
  return null;
}
