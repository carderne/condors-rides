import { convertRouteToLineString, getRideWithGpsRoute } from "@/clients/ridewithgps";
import { followStravaShortLink, getStravaRoute } from "@/clients/strava";
import polyline from "@mapbox/polyline";

export type RouteInfo = { url: string; name: string; geojson: GeoJSON.LineString };

export async function getRouteInfo(url: string | undefined): Promise<RouteInfo | null> {
  if (!url) {
    return null;
  }

  const cleanUrl = url.split("?")[0]!;
  const siteId = getRouteSiteId(cleanUrl);
  if (!siteId) {
    return null;
  }
  const { site, id } = siteId;

  if (site === "strava") {
    const stravaResponse = await getStravaRoute(id);
    if (!stravaResponse.ok) {
      return null;
    }
    return {
      url: cleanUrl,
      name: stravaResponse.data.name,
      geojson: polyline.toGeoJSON(stravaResponse.data.map.polyline),
    };
  }

  if (site === "strava-fwd") {
    const actualUrl = await followStravaShortLink(url);
    return getRouteInfo(actualUrl);
  }

  if (site === "rwg") {
    const response = await getRideWithGpsRoute(id);
    if (!response.ok) {
      return null;
    }
    return {
      url: cleanUrl,
      name: response.data.route.name,
      geojson: convertRouteToLineString(response.data),
    };
  }

  return site; // never
}

export async function getGeojson(route: string | undefined): Promise<GeoJSON.LineString | null> {
  const info = await getRouteInfo(route);
  return info?.geojson ?? null;
}

type Site = "strava" | "strava-fwd" | "rwg";
type Pattern = { site: Site; re: RegExp };
type SiteWithId = { site: Site; id: string };

function getRouteSiteId(url: string): SiteWithId | null {
  const patterns: Pattern[] = [
    { site: "strava", re: /.*strava\.com\/routes\/(\d+).*/ },
    { site: "strava-fwd", re: /.*strava.app.link\/(\w+).*/ },
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

export function getAverageCoords(geojson: GeoJSON.LineString): { lon: number; lat: number } {
  const { coordinates } = geojson;
  const sum = coordinates.reduce(
    (acc, pos) => ({ lon: acc.lon + pos[0]!, lat: acc.lat + pos[1]! }),
    { lon: 0, lat: 0 },
  );

  return {
    lon: sum.lon / coordinates.length,
    lat: sum.lat / coordinates.length,
  };
}
