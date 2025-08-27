"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { type RefObject, useEffect, useRef } from "react";

export function Map({ geojson, osKey }: { geojson: GeoJSON.LineString; osKey: string }) {
  const mapContainer: RefObject<HTMLDivElement | null> = useRef(null);
  const map: RefObject<maplibregl.Map | null> = useRef(null);

  useEffect(() => {
    if (map.current) {
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style:
        "https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Light.json",
      transformRequest: transformRequest(osKey),
      center: [-1.23, 51.75],
      zoom: 10,
    });

    map.current.on("load", () => {
      if (!map.current || !geojson) {
        return;
      }

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: geojson,
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0080ff",
          "line-width": 4,
        },
      });

      if (geojson.coordinates && geojson.coordinates.length > 0) {
        const bounds = new maplibregl.LngLatBounds();

        geojson.coordinates.forEach((coord) => {
          bounds.extend([coord[0]!, coord[1]!]);
        });

        map.current.fitBounds(bounds, {
          padding: 20,
          maxZoom: 15,
        });
      }
    });
  }, [geojson]);

  return (
    <div className="h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}

function transformRequest(osKey: string) {
  return (url: string, resourceType: maplibregl.ResourceType | undefined) => {
    if (resourceType !== "Style" && url.startsWith("https://api.os.uk")) {
      const u = new URL(url);
      if (!u.searchParams.has("key")) u.searchParams.append("key", osKey);
      if (!u.searchParams.has("srs")) u.searchParams.append("srs", "3857");
      return { url: new Request(u).url };
    }
  };
}
