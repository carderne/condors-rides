import type { Surface } from "@/db/schema";

interface SurfaceStyle {
  label: string;
  text: string;
  button: string;
  banner: string;
  border: string;
}

export function surfaceStyle(surface: Surface): SurfaceStyle {
  switch (surface) {
    case "road":
      return {
        label: "Road ride",
        text: "text-primary",
        button: "text-white! bg-primary! hover:bg-pink-700!",
        banner: "from-red-400 to-primary",
        border: "border-primary",
      };
    case "offroad":
      return {
        label: "Off road",
        text: "text-amber-800",
        button: "text-white! bg-amber-800! hover:bg-amber-900!",
        banner: "from-amber-700 to-amber-800",
        border: "border-amber-800",
      };
    case "virtual":
      return {
        label: "Virtual",
        text: "text-purple-800",
        button: "text-white! bg-purple-800! hover:bg-purple-900!",
        banner: "from-purple-700 to-purple-800",
        border: "border-purple-800",
      };
    case "event":
      return {
        label: "Social, not a ride",
        text: "text-green-800",
        button: "text-white! bg-green-800! hover:bg-green-900!",
        banner: "from-green-700 to-green-800",
        border: "border-green-800",
      };
    case "external":
      return {
        label: "Races and such",
        text: "text-blue-800",
        button: "text-white! bg-blue-800! hover:bg-blue-900!",
        banner: "from-blue-700 to-blue-800",
        border: "border-blue-800",
      };
  }
}
