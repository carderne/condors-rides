import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// maplibre-gl v6 resolves its worker at runtime from a dynamic path, which
// bundlers can't see. A static `new URL` makes the bundler emit the file.
maplibregl.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

export { maplibregl };
