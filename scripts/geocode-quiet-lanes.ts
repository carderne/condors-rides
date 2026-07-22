import { getConfig } from "@/lib/config";
import { writeFileSync } from "fs";

const {
  googleMaps: { apiKey },
} = getConfig();

// label -> geocode query (town/village + road, all Oxfordshire)
const LANES: { label: string; query: string }[] = [
  { label: "Blackthorn (Lower Rd / Station Rd)", query: "Station Road, Blackthorn, Oxfordshire" },
  { label: "Wendlebury Road", query: "Wendlebury Road, Wendlebury, Oxfordshire" },
  { label: "Kennington (Bagley Wood Road)", query: "Bagley Wood Road, Kennington, Oxfordshire" },
  { label: "Radley (Sugworth Lane)", query: "Sugworth Lane, Radley, Oxfordshire" },
  { label: "Curbridge (Witney Road)", query: "Witney Road, Curbridge, Oxfordshire" },
  { label: "Hanwell Lane", query: "Hanwell Lane, Hanwell, Banbury, Oxfordshire" },
  { label: "Bainton (Stoke Lyne)", query: "Bainton, Bicester, Oxfordshire" },
  { label: "Towersey", query: "Towersey, Thame, Oxfordshire" },
  { label: "Ewelme (Cat Lane / Firebrass Hill)", query: "Cat Lane, Ewelme, Oxfordshire" },
  { label: "West Lockinge", query: "West Lockinge, Wantage, Oxfordshire" },
  { label: "Combe (Park Road)", query: "Park Road, Combe, Witney, Oxfordshire" },
  { label: "Marston (Elms Drive)", query: "Elms Drive, Marston, Oxford" },
  { label: "Longcot (Mailings Lane)", query: "Mailings Lane, Longcot, Oxfordshire" },
];

type LatLng = { lat: number; lng: number };

async function geocode(
  query: string,
): Promise<{ bounds?: { northeast: LatLng; southwest: LatLng }; location: LatLng } | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("components", "country:GB");
  url.searchParams.set("region", "uk");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results: {
      geometry: { bounds?: { northeast: LatLng; southwest: LatLng }; location: LatLng };
    }[];
  };
  if (data.status !== "OK" || !data.results[0]) return null;
  return data.results[0].geometry;
}

async function main() {
  const features: GeoJSON.Feature[] = [];

  for (const lane of LANES) {
    const geom = await geocode(lane.query);
    if (!geom) {
      console.log(`FAIL ${lane.label} — no result`);
      continue;
    }

    if (geom.bounds) {
      // Approximate the road as the diagonal of its bounding box (Google
      // geocoding doesn't return the actual polyline). Good enough for a look.
      const { northeast: ne, southwest: sw } = geom.bounds;
      features.push({
        type: "Feature",
        properties: { label: lane.label },
        geometry: {
          type: "LineString",
          coordinates: [
            [sw.lng, sw.lat],
            [ne.lng, ne.lat],
          ],
        },
      });
      console.log(`OK   ${lane.label} (line)`);
    } else {
      // No bounds (a point) — drop a point feature instead.
      features.push({
        type: "Feature",
        properties: { label: lane.label },
        geometry: { type: "Point", coordinates: [geom.location.lng, geom.location.lat] },
      });
      console.log(`OK   ${lane.label} (point)`);
    }
  }

  const fc: GeoJSON.FeatureCollection = { type: "FeatureCollection", features };
  const out = "src/app/(public)/quiet/lanes.json";
  writeFileSync(out, JSON.stringify(fc, null, 2));
  console.log(`Wrote ${features.length} features to ${out}`);
  process.exit(0);
}

main();
