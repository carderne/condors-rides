import { getRouteInfo } from "@/lib/geojson";

const url = process.argv[2];
if (!url) {
  console.error("Usage: tsx scripts/test-url.ts <url>");
  process.exit(1);
}

const info = await getRouteInfo(url);
if (!info) {
  console.log("No route info");
  process.exit(0);
}

console.log("url:", info.url);
console.log("name:", info.name);
console.log("coords:", info.geojson.coordinates.length);
console.log("first:", info.geojson.coordinates[0]);
