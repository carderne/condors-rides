import { convertRouteToLineString, getRideWithGpsRoute } from "@/clients/ridewithgps";
import { followStravaShortLink, getStravaRoute } from "@/clients/strava";
import polyline from "@mapbox/polyline";

export async function getGeojson(route: string | undefined): Promise<GeoJSON.LineString | null> {
  if (!route) {
    return null;
  }

  const siteId = getRouteSiteId(route);
  if (!siteId) {
    return null;
  }
  const { site, id } = siteId;

  if (site === "strava") {
    const stravaResponse = await getStravaRoute(id);
    if (!stravaResponse.success) {
      return null;
    }
    const geojson = polyline.toGeoJSON(stravaResponse.data.map.polyline);
    return geojson;
  }

  if (site === "strava-fwd") {
    const actualUrl = await followStravaShortLink(route);
    return getGeojson(actualUrl);
  }

  if (site === "rwg") {
    const response = await getRideWithGpsRoute(id);
    if (!response.success) {
      return null;
    }
    const geojson = convertRouteToLineString(response.data);
    return geojson;
  }

  return site; // never
}

type Site = "strava" | "strava-fwd" | "rwg";
type Pattern = { site: Site; re: RegExp };
type SiteWithId = { site: Site; id: string };

function getRouteSiteId(url: string): SiteWithId | null {
  const patterns: Pattern[] = [
    { site: "strava", re: /.*strava\.com\/routes\/(\d+).*/ },
    { site: "strava-fwd", re: /.*strava.app.link\/(\d+).*/ },
    { site: "rwg", re: /.*ridewithgps\.com\/routes\/(\d+).*/ },
  ];
  for (const pattern of patterns) {
    const { site, re } = pattern;
    const match = url.match(re);
    if (match && match[1] !== undefined) {
      return { site, id: match[1] };
    }
  }
  return null;
}
