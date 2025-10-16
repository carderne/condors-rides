"use client";

import type { WeatherData } from "@/clients/weather";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DropletsIcon, ThermometerIcon, WindIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { H3 } from "../ui/typography";
import { getWeatherAction } from "./actions";

export function WeatherCard({ ride }: { ride: { id: string } }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      const data = await getWeatherAction(ride.id);
      if (data.ok) {
        setWeather(data.data);
      } else {
        setHidden(true);
      }
    }

    fetchWeather();
  }, []);

  const getWindDirection = (bearing: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(bearing / 45) % 8];
  };

  return (
    <Card
      className={cn(
        "grid w-full grid-cols-2 items-center justify-around bg-gray-50 p-3 md:flex",
        "transition-all duration-300",
        weather ? "opacity-100" : "opacity-0",
        hidden && "max-h-0 p-0 opacity-0",
      )}
    >
      <div>
        <H3 className="text-primary">Forecast</H3>
      </div>
      <div className="flex items-center gap-3">
        <ThermometerIcon className="text-primary hidden size-6 md:block" />
        <div>
          <p className="text-muted-foreground text-sm">Feels Like</p>
          <p className="text-xl font-semibold">{weather?.apparentTemperature.toFixed(1)}°C</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <WindIcon className="text-primary hidden size-6 md:block" />
        <div>
          <p className="text-muted-foreground text-sm">Wind</p>
          <p className="text-xl font-semibold">
            {weather ? weather.windSpeed.toFixed(1) : ""} km/h{" "}
            {weather ? getWindDirection(weather.windBearing) : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropletsIcon className="text-primary hidden size-6 md:block" />
        <div>
          <p className="text-muted-foreground text-sm">Precipitation</p>
          <p className="text-xl font-semibold">
            {weather ? (weather.precipProbability * 100).toFixed(0) : ""}%
          </p>
        </div>
      </div>
    </Card>
  );
}
