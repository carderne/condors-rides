"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { type RefObject, useEffect, useRef } from "react";
import lanes from "./lanes.json";

const PINK = "#ec4899";

export function QuietMap({ osKey }: { osKey: string }) {
  const mapContainer: RefObject<HTMLDivElement | null> = useRef(null);
  const map: RefObject<maplibregl.Map | null> = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style:
        "https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Light.json",
      transformRequest: (url, resourceType) => {
        if (resourceType !== "Style" && url.startsWith("https://api.os.uk")) {
          const u = new URL(url);
          if (!u.searchParams.has("key")) u.searchParams.append("key", osKey);
          if (!u.searchParams.has("srs")) u.searchParams.append("srs", "3857");
          return { url: new Request(u).url };
        }
      },
      center: [-1.3, 51.78],
      zoom: 9,
    });

    map.current.on("load", () => {
      const m = map.current!;
      const fc = lanes as GeoJSON.FeatureCollection;

      m.addSource("lanes", { type: "geojson", data: fc });

      m.addLayer({
        id: "lanes-lines",
        type: "line",
        source: "lanes",
        filter: ["==", ["geometry-type"], "LineString"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": PINK, "line-width": 6, "line-opacity": 0.9 },
      });

      m.addLayer({
        id: "lanes-points",
        type: "circle",
        source: "lanes",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 7,
          "circle-color": PINK,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      m.addLayer({
        id: "lanes-labels",
        type: "symbol",
        source: "lanes",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#9d174d",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      // Fit to all features.
      const bounds = new maplibregl.LngLatBounds();
      for (const f of fc.features) {
        const g = f.geometry;
        if (g.type === "LineString")
          g.coordinates.forEach((c) => bounds.extend(c as [number, number]));
        if (g.type === "Point") bounds.extend(g.coordinates as [number, number]);
      }
      if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 60 });
    });
  }, [osKey]);

  return <div ref={mapContainer} className="h-[calc(100dvh-72px)] w-full" />;
}
