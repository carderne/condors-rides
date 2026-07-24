import { convertRouteToLineString, getRideWithGpsRoute } from "@/clients/ridewithgps";
import { followStravaShortLink, getStravaRoute } from "@/clients/strava";
import { getConfig } from "@/lib/config";
import { lineStringToGpx } from "@/lib/gpx";
import polyline from "@mapbox/polyline";

export type RouteInfo = {
  url: string;
  name: string;
  geojson: GeoJSON.LineString;
  gpx: string;
};

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
    const geojson = polyline.toGeoJSON(stravaResponse.data.map.polyline);
    return {
      url: cleanUrl,
      name: stravaResponse.data.name,
      geojson,
      gpx: lineStringToGpx(geojson, stravaResponse.data.name),
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
    const geojson = convertRouteToLineString(response.data);
    return {
      url: cleanUrl,
      name: response.data.route.name,
      geojson,
      gpx: lineStringToGpx(geojson, response.data.route.name),
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

// The cafe stop field is free text, so people enter all sorts of things:
// non-answers ("n/a", "maybe"), and full sentences with a real place buried in
// them ("New Ground at the end"). We only want a map pin when we're reasonably
// confident, so we bias hard towards precision over recall: when in doubt,
// return null (no pin) rather than a wrong pin.

// Rough bounding box for the Oxford area (covers ~London, Bristol, Birmingham).
// Passed to Places Text Search as a HARD `locationRestriction`, so results can
// never land on the wrong continent.
const OXFORD_RECTANGLE = {
  low: { latitude: 50.0, longitude: -2.7 },
  high: { latitude: 52.7, longitude: 0.3 },
};

// Exact (normalized) non-answers people type instead of a location.
const NON_LOCATIONS = new Set([
  "n/a",
  "na",
  "n.a",
  "none",
  "no",
  "nil",
  "nope",
  "nan",
  "tbc",
  "tba",
  "tbd",
  "unknown",
  "?",
  "-",
  "--",
  "x",
  "maybe",
  "sure",
  "yes",
  "possibly",
  "various",
  "varies",
  "optional",
  "depends",
  "undecided",
]);

// Phrases that, when they appear at the START of the text, mean "there isn't
// really a location here".
const NON_LOCATION_PREFIXES = [
  "no cafe",
  "no caf\u00e9",
  "no stop",
  "no coffee",
  "none planned",
  "none,",
  "none -",
  "none \u2013",
  "not sure",
  "not decided",
  "bring your own",
  "byo",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.!,]+$/, "")
    .trim();
}

function isNonLocation(text: string): boolean {
  const normalized = normalize(text);
  if (normalized.length === 0) {
    return true;
  }
  if (NON_LOCATIONS.has(normalized)) {
    return true;
  }
  if (NON_LOCATION_PREFIXES.some((p) => normalized.startsWith(p))) {
    return true;
  }
  return false;
}

// We only want to pin actual venues a ride would stop at: cafes, pubs, bars,
// restaurants, bakeries, shops, etc. Places Text Search returns a `types` array
// per place; we require at least one of these. This rejects bare areas
// ("Headington", "Appleton"), parks, and other non-venue results.
const ACCEPTED_PLACE_TYPES = new Set([
  "cafe",
  "coffee_shop",
  "coffee_roastery",
  "bakery",
  "bar",
  "pub",
  "wine_bar",
  "cocktail_bar",
  "restaurant",
  "diner",
  "meal_takeaway",
  "food",
  "food_store",
  "grocery_store",
  "supermarket",
  "convenience_store",
  "store",
  "deli",
  "ice_cream_shop",
  "tea_house",
  "sandwich_shop",
  "farm", // farm shops / cafes (e.g. "The Barn at Turville Heath")
]);

// Place types ending in these suffixes are also food/drink venues (Google has a
// long tail like `pizza_restaurant`, `hamburger_restaurant`, `coffee_shop`).
const ACCEPTED_PLACE_TYPE_SUFFIXES = ["_restaurant", "_shop", "_store", "_bar"];

function isVenueType(type: string): boolean {
  return (
    ACCEPTED_PLACE_TYPES.has(type) ||
    ACCEPTED_PLACE_TYPE_SUFFIXES.some((suffix) => type.endsWith(suffix))
  );
}

interface PlacesSearchResult {
  location?: { latitude?: number; longitude?: number };
  types?: string[];
}

interface PlacesSearchResponse {
  places?: PlacesSearchResult[];
}

function extractPosition(place: PlacesSearchResult | undefined): GeoJSON.Position | null {
  if (!place) {
    return null;
  }

  // Only accept actual food/drink/retail venues, not areas, parks, etc.
  const types = place.types ?? [];
  if (!types.some(isVenueType)) {
    return null;
  }

  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return [lng, lat];
}

/**
 * Geocode a free-text cafe-stop string into a GeoJSON Position ([lon, lat]).
 *
 * The cafe stop field is natural language, not a clean place query, so this is
 * tuned for precision: it uses the Google Places Text Search API (POI-aware, so
 * it copes with both bare names and full sentences), hard-restricts results to
 * the Oxford area, and only accepts actual food/drink/retail venues. It returns
 * null unless it gets such a match — a wrong pin is worse than no pin.
 *
 * If a `route` is provided, the result is also rejected unless it lands within
 * `maxRouteDistanceKm` (default 10km) of some point on the route, which catches
 * venues that share a name but are nowhere near the actual ride.
 *
 * The request is aborted after `timeoutMs` (default 5s) so callers don't get
 * blocked indefinitely.
 */
export async function geocode(
  query: string,
  options: {
    timeoutMs?: number;
    route?: GeoJSON.LineString | null;
    maxRouteDistanceKm?: number;
  } = {},
): Promise<GeoJSON.Position | null> {
  const { timeoutMs = 5000, route = null, maxRouteDistanceKm = 10 } = options;

  const text = query.trim();
  if (isNonLocation(text)) {
    return null;
  }

  const {
    googleMaps: { apiKey },
  } = getConfig();

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // Field mask is required; only ask for what we need.
      "X-Goog-FieldMask": "places.location,places.types",
    },
    body: JSON.stringify({
      textQuery: text,
      regionCode: "GB",
      languageCode: "en",
      maxResultCount: 1,
      locationRestriction: { rectangle: OXFORD_RECTANGLE },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as PlacesSearchResponse;
  const position = extractPosition(data.places?.[0]);
  if (!position) {
    return null;
  }

  // If we know the route, the cafe stop should be near it. Reject otherwise:
  // it's probably a same-named venue somewhere else.
  if (route && !isNearRoute(position, route, maxRouteDistanceKm)) {
    return null;
  }

  return position;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two [lon, lat] positions, in kilometres. */
function haversineKm(a: GeoJSON.Position, b: GeoJSON.Position): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRadians(lat2! - lat1!);
  const dLon = toRadians(lon2! - lon1!);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1!)) * Math.cos(toRadians(lat2!)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Whether `position` is within `maxKm` of any vertex on the route. This is an
 * approximation (it measures distance to the route's points, not its segments),
 * which is fine for a generous ~10km tolerance.
 */
function isNearRoute(
  position: GeoJSON.Position,
  route: GeoJSON.LineString,
  maxKm: number,
): boolean {
  return route.coordinates.some((point) => haversineKm(position, point) <= maxKm);
}

export type CafeStop = { name: string | null; loc: GeoJSON.Position };

/**
 * Dedupe cafe stops so we only keep one pin per ~`minKm`-radius cluster (default
 * 1km). Uses a coarse lat/lon grid so we only compare nearby candidates instead
 * of every pair, which keeps it cheap for large inputs.
 */
export function dedupeCafeStops(
  stops: { name: string | null; loc: GeoJSON.Position | null }[],
  minKm = 1,
): CafeStop[] {
  // ~111km per degree of latitude; size the grid cells to the dedupe radius so
  // any two points within `minKm` fall in the same or an adjacent cell.
  const cellDeg = minKm / 111;
  const buckets = new Map<string, GeoJSON.Position[]>();
  const kept: CafeStop[] = [];

  for (const stop of stops) {
    const loc = stop.loc;
    if (!loc || typeof loc[0] !== "number" || typeof loc[1] !== "number") {
      continue;
    }
    const [lon, lat] = loc as [number, number];
    const cx = Math.floor(lon / cellDeg);
    const cy = Math.floor(lat / cellDeg);

    let isDuplicate = false;
    // Check this cell and its 8 neighbours.
    outer: for (let dx = -1; dx <= 1 && !isDuplicate; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighbours = buckets.get(`${cx + dx}:${cy + dy}`);
        if (!neighbours) continue;
        for (const other of neighbours) {
          if (haversineKm(loc, other) <= minKm) {
            isDuplicate = true;
            break outer;
          }
        }
      }
    }
    if (isDuplicate) {
      continue;
    }

    const key = `${cx}:${cy}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(loc);
    } else {
      buckets.set(key, [loc]);
    }
    kept.push({ name: stop.name, loc });
  }

  return kept;
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
