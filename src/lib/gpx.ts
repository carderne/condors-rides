// We don't rely on the route providers for GPX downloads (Strava has an
// export endpoint but RideWithGPS has none), so we generate GPX ourselves from
// the GeoJSON LineString we already fetch. Coordinates are [lon, lat] with an
// optional third elevation value.

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function lineStringToGpx(geojson: GeoJSON.LineString, name: string): string {
  const trackpoints = geojson.coordinates
    .map((coord) => {
      const [lon, lat, ele] = coord;
      if (typeof lon !== "number" || typeof lat !== "number") {
        return null;
      }
      const eleTag = typeof ele === "number" ? `<ele>${ele}</ele>` : "";
      return `      <trkpt lat="${lat}" lon="${lon}">${eleTag}</trkpt>`;
    })
    .filter((point): point is string => point !== null)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cowley Road Condors" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>
`;
}
