import { getRidePreview } from "@/dal/ridePreview";
import type { Surface } from "@/db/schema";
import { surfaceStyle } from "@/lib/surface";
import { format } from "date-fns";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Condors ride";

const surfaceHex: Record<Surface, string> = {
  road: "#db2777",
  offroad: "#92400e",
  virtual: "#6b21a8",
  event: "#166534",
  external: "#1e40af",
};

// Project a lng/lat LineString into an SVG polyline that fits the given box.
function routeSvg(
  geojson: GeoJSON.LineString,
  width: number,
  height: number,
  color: string,
): string | null {
  const coords = geojson.coordinates;
  if (!coords || coords.length < 2) return null;

  const pad = 24;
  const project = (lng: number, lat: number) => {
    const x = lng;
    const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2));
    return [x, y] as const;
  };

  const pts = coords.map(([lng, lat]) => project(lng!, lat!));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const spanX = maxX - minX || 1e-6;
  const spanY = maxY - minY || 1e-6;
  const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;

  const d = pts
    .map(([x, y]) => {
      const px = offsetX + (x - minX) * scale;
      // Flip Y: north (larger mercator y) should be at the top.
      const py = offsetY + (maxY - y) * scale;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#f3f4f6"/><polyline points="${d}" fill="none" stroke="${color}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ride = await getRidePreview(slug);

  const accent = ride ? surfaceHex[ride.surface] : "#db2777";
  const name = ride?.name ?? "Condors Rides";
  const geojson = ride?.route?.geojson ?? null;
  const mapWidth = 560;
  const mapUri = geojson ? routeSvg(geojson, mapWidth, size.height, accent) : null;

  const stats: { label: string; value: string }[] = [];
  if (ride) {
    stats.push({
      label: "When",
      value: `${format(ride.date, "EEE d MMM")}, ${ride.time.slice(0, 5)}`,
    });
    stats.push({ label: "Type", value: surfaceStyle(ride.surface).label });
    if (ride.distance !== null) stats.push({ label: "Distance", value: `${ride.distance} km` });
    if (ride.elevation !== null) stats.push({ label: "Climbing", value: `${ride.elevation} m` });
    if (ride.speed) stats.push({ label: "Speed", value: `${ride.speed} kph` });
  }

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff" }}>
      {/* Left: details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          padding: 56,
          background: accent,
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700 }}>
          🚴 Cowley Road Condors
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "12px 20px",
              }}
            >
              <div style={{ fontSize: 20, opacity: 0.85 }}>{s.label}</div>
              <div style={{ fontSize: 34, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: map */}
      {mapUri ? (
        <img src={mapUri} width={mapWidth} height={size.height} alt="Route map" />
      ) : (
        <div
          style={{
            display: "flex",
            width: mapWidth,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            color: "#9ca3af",
            fontSize: 28,
          }}
        >
          No route map
        </div>
      )}
    </div>,
    { ...size },
  );
}
