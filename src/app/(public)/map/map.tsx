"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RouteDirection, Surface } from "@/db/schema";
import type { User } from "@/db/zod";
import type { CafeStop } from "@/lib/geojson";
import { LoaderCircleIcon } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { getRemainingRoutes, getRouteVoteStatus } from "./actions";
import { RouteInfoPanel } from "./panel";
import { type RouteHydrated, routesToFeatureCollection, transformRequest } from "./utils";

const ROAD_COLOR = "hsl(327, 73%, 57%)";
const OFFROAD_COLOR = "#92400e";
const SELECTED_COLOR = "#000000";

export function RouteMap({
  osKey,
  initialRoutes,
  cafeStops,
  user,
}: {
  osKey: string;
  initialRoutes: RouteHydrated[];
  cafeStops: CafeStop[];
  user: User | null;
}) {
  const mapContainer: RefObject<HTMLDivElement | null> = useRef(null);
  const map: RefObject<maplibregl.Map | null> = useRef(null);
  const cafeMarkers: RefObject<maplibregl.Marker[]> = useRef([]);

  const [selectedRoute, setSelectedRoute] = useState<RouteHydrated | null>(null);
  const [surfaceFilter, setSurfaceFilter] = useState<"all" | "road" | "offroad">("all");
  const [allLoaded, setAllLoaded] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [minDistance, setMinDistance] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [showCafeStops, setShowCafeStops] = useState(false);

  const selectedIdRef = useRef<string | null>(null);
  const promotedIds = useRef(new Set(initialRoutes.map((r) => r.id)));

  const updateSources = useCallback(
    (allRoutes: RouteHydrated[]) => {
      const m = map.current;
      if (!m) return;
      const routeSource = m.getSource("routes") as maplibregl.GeoJSONSource | undefined;
      if (routeSource)
        routeSource.setData(routesToFeatureCollection(allRoutes, promotedIds.current));
    },
    [promotedIds],
  );

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style:
        "https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Light.json",
      transformRequest: transformRequest(osKey),
      center: [-1.23, 51.75],
      zoom: 10,
      maxBounds: [
        [-10.76, 49.53],
        [1.96, 60.86],
      ],
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.current.on("load", () => {
      const m = map.current!;

      m.addSource("routes", {
        type: "geojson",
        data: routesToFeatureCollection(initialRoutes, promotedIds.current),
        promoteId: "routeId",
      });

      // All routes (unselected styling)
      m.addLayer({
        id: "routes",
        type: "line",
        source: "routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["case", ["==", ["get", "surface"], "road"], ROAD_COLOR, OFFROAD_COLOR],
          "line-width": ["interpolate", ["linear"], ["zoom"], 7, 2, 15, 6],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.6, 15, 0.5],
        },
      });

      // Selected route casing (on top)
      m.addLayer({
        id: "routes-casing",
        type: "line",
        source: "routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": SELECTED_COLOR,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            ["case", ["boolean", ["feature-state", "selected"], false], 10, 0],
            15,
            ["case", ["boolean", ["feature-state", "selected"], false], 18, 0],
          ],
          "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.6, 0],
        },
      });

      // Selected route line (on top of casing)
      m.addLayer({
        id: "routes-selected",
        type: "line",
        source: "routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": SELECTED_COLOR,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            ["case", ["boolean", ["feature-state", "selected"], false], 2, 0],
            15,
            ["case", ["boolean", ["feature-state", "selected"], false], 6, 0],
          ],
          "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0],
        },
      });

      m.on("click", "routes", (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0]!;
        const props = feature.properties;
        const routeId = props.routeId as string;

        if (selectedIdRef.current) {
          m.setFeatureState({ source: "routes", id: selectedIdRef.current }, { selected: false });
        }

        selectedIdRef.current = routeId;
        m.setFeatureState({ source: "routes", id: routeId }, { selected: true });

        const selected: RouteHydrated = {
          id: routeId,
          url: props.url as string,
          name: props.name as string,
          distance: props.distance as number,
          elevation: props.elevation as number | null,
          surface: props.surface as Surface,
          cafeStop: props.cafeStop as string | null,
          direction: props.direction as RouteDirection | null,
          notes: props.notes as string | null,
          promoted: props.isPromoted as boolean,
          geojson: null,
          userVoted: undefined,
          numVotes: 0,
        };
        setSelectedRoute(selected);

        getRouteVoteStatus(routeId).then(({ userVoted, numVotes }) => {
          setSelectedRoute((prev) =>
            prev?.id === routeId ? { ...prev, userVoted, numVotes } : prev,
          );
        });
      });

      m.on("click", (e) => {
        const features = m.queryRenderedFeatures(e.point, { layers: ["routes"] });
        if (features.length === 0) {
          if (selectedIdRef.current) {
            m.setFeatureState({ source: "routes", id: selectedIdRef.current }, { selected: false });
            selectedIdRef.current = null;
          }
          setSelectedRoute(null);
        }
      });

      m.on("mouseenter", "routes", () => {
        m.getCanvas().style.cursor = "pointer";
      });

      m.on("mouseleave", "routes", () => {
        m.getCanvas().style.cursor = "";
      });

      // Cafe stops: a DOM marker per stop with an always-visible label that
      // links to a Google Maps search. Added to the map only when toggled on.
      cafeMarkers.current = cafeStops.map((stop) => {
        const name = stop.name ?? "Cafe stop";

        const el = document.createElement("div");
        el.className = "flex flex-col items-center";

        const dot = document.createElement("div");
        dot.className = "size-2.5 rounded-full border border-white bg-violet-600 shadow";
        el.appendChild(dot);

        const link = document.createElement("a");
        link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = name;
        link.className =
          "mt-0.5 max-w-40 truncate rounded bg-white/90 px-1 py-0.5 text-[10px] font-medium text-violet-700 shadow hover:underline";
        el.appendChild(link);

        return new maplibregl.Marker({ element: el, anchor: "top" }).setLngLat(
          stop.loc as [number, number],
        );
      });
    });
  }, [osKey, initialRoutes, cafeStops]);

  // Toggle cafe stop markers on/off.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const marker of cafeMarkers.current) {
      if (showCafeStops) {
        marker.addTo(m);
      } else {
        marker.remove();
      }
    }
  }, [showCafeStops]);

  useEffect(() => {
    const m = map.current;
    if (!m || !m.isStyleLoaded()) return;

    const buildFilter = (): maplibregl.FilterSpecification | null => {
      const conditions: maplibregl.ExpressionSpecification[] = [];
      if (surfaceFilter !== "all") {
        conditions.push(["==", ["get", "surface"], surfaceFilter]);
      }
      if (!showAll) {
        conditions.push(["==", ["get", "isPromoted"], true]);
      }
      if (minDistance > 0) {
        conditions.push([">=", ["get", "distance"], minDistance]);
      }
      if (maxDistance !== null) {
        conditions.push(["<=", ["get", "distance"], maxDistance]);
      }
      if (conditions.length === 0) return null;
      if (conditions.length === 1) return conditions[0]!;
      return ["all", ...conditions];
    };

    const filter = buildFilter();
    m.setFilter("routes", filter);
    m.setFilter("routes-casing", filter);
    m.setFilter("routes-selected", filter);
  }, [surfaceFilter, showAll, minDistance, maxDistance]);

  // Auto-load remaining routes after map init
  useEffect(() => {
    let cancelled = false;
    getRemainingRoutes().then((remaining) => {
      if (cancelled) return;
      const allRoutes = [...initialRoutes, ...remaining];
      updateSources(allRoutes);
      setAllLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [initialRoutes, updateSources]);

  function handleDeselectRoute() {
    if (selectedIdRef.current && map.current) {
      map.current.setFeatureState(
        { source: "routes", id: selectedIdRef.current },
        { selected: false },
      );
      selectedIdRef.current = null;
    }
    setSelectedRoute(null);
  }

  return (
    <div className="relative h-[calc(100dvh-72px)] w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Top-left controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Surface filter pill group */}
        <div className="flex gap-1 rounded-lg bg-white/90 p-1 shadow-md">
          <Button
            size="sm"
            variant={surfaceFilter === "all" ? "default" : "ghost"}
            onClick={() => setSurfaceFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={surfaceFilter === "road" ? "default" : "ghost"}
            onClick={() => setSurfaceFilter("road")}
          >
            Road
          </Button>
          <Button
            size="sm"
            variant={surfaceFilter === "offroad" ? "default" : "ghost"}
            onClick={() => setSurfaceFilter("offroad")}
          >
            Off-road
          </Button>
        </div>

        {/* Distance filter */}
        <div className="flex w-fit gap-0 rounded-lg bg-white/90 py-1 shadow-md">
          <Select value={String(minDistance)} onValueChange={(v) => setMinDistance(Number(v))}>
            <SelectTrigger size="sm" className="border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Min: 0km</SelectItem>
              <SelectItem value="40">Min: 40km</SelectItem>
              <SelectItem value="80">Min: 80km</SelectItem>
              <SelectItem value="120">Min: 120km</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={maxDistance === null ? "none" : String(maxDistance)}
            onValueChange={(v) => setMaxDistance(v === "none" ? null : Number(v))}
          >
            <SelectTrigger size="sm" className="border-none shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">Max: 50km</SelectItem>
              <SelectItem value="90">Max: 90km</SelectItem>
              <SelectItem value="130">Max: 130km</SelectItem>
              <SelectItem value="none">No max</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Promoted / All toggle */}
        <div className="flex w-fit gap-1 rounded-lg bg-white/90 p-1 shadow-md">
          <Button
            size="sm"
            variant={showAll ? "default" : "ghost"}
            disabled={!allLoaded}
            onClick={() => setShowAll(true)}
          >
            {!allLoaded ? <LoaderCircleIcon className="size-4 animate-spin" /> : "All"}
          </Button>
          <Button
            size="sm"
            variant={!showAll ? "default" : "ghost"}
            onClick={() => setShowAll(false)}
          >
            Promoted
          </Button>
        </div>

        {/* Cafe stops toggle (default off) */}
        <div className="flex w-fit gap-1 rounded-lg bg-white/90 p-1 shadow-md">
          <Button
            size="sm"
            variant={showCafeStops ? "default" : "ghost"}
            onClick={() => setShowCafeStops((v) => !v)}
          >
            Cafe stops
          </Button>
        </div>
      </div>

      {/* Bottom-left info panel */}
      {selectedRoute && (
        <RouteInfoPanel
          route={selectedRoute}
          user={user}
          onClose={handleDeselectRoute}
          onUpdate={setSelectedRoute}
        />
      )}
    </div>
  );
}
