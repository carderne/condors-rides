"use client";

import { Map } from "@/components/map";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { getGeojsonAction } from "./actions";
import { type RouteHydrated } from "./columns";

export function RoutesTableMap({ route, osKey }: { route: RouteHydrated; osKey: string }) {
  const [loading, setLoading] = useState(false);
  const [geojson, setGeojson] = useState<GeoJSON.LineString>();

  useEffect(() => {
    const fn = async () => {
      setLoading(true);
      try {
        const data = await getGeojsonAction(route.id);
        if (data) {
          setGeojson(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, []);

  return (
    <div className="flex h-80 w-full items-center justify-center">
      {loading ? (
        <div className="">
          <Loader2Icon className="animate-spin" />{" "}
        </div>
      ) : geojson ? (
        <Map geojson={geojson} osKey={osKey} />
      ) : (
        <div>No map</div>
      )}
    </div>
  );
}
