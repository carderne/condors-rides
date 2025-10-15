"use client";

import type { WeatherData } from "@/clients/weather";
import { Card, CardContent } from "@/components/ui/card";
import { DropletsIcon, Loader2Icon, ThermometerIcon, WindIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { H3 } from "../ui/typography";
import { getWeatherAction } from "./actions";

export function WeatherCard({ ride }: { ride: { id: string } }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const data = await getWeatherAction(ride.id);
        if (data.success) {
          setWeather(data.weather!);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  const getWindDirection = (bearing: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(bearing / 45) % 8];
  };

  if (loading) {
    return (
      <Card className="border-primary/20 w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-red-200">
        <CardContent className="py-8 text-center text-red-500">{error}</CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="grid w-full grid-cols-2 items-center justify-around bg-gray-50 p-3 md:flex">
      <div>
        <H3 className="text-primary">Forecast</H3>
      </div>
      <div className="flex items-center gap-3">
        <ThermometerIcon className="text-primary hidden size-6 md:block" />
        <div>
          <p className="text-muted-foreground text-sm">Feels Like</p>
          <p className="text-xl font-semibold">{weather.apparentTemperature.toFixed(1)}°C</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <WindIcon className="text-primary hidden size-6 md:block" />
        <div>
          <p className="text-muted-foreground text-sm">Wind</p>
          <p className="text-xl font-semibold">
            {weather.windSpeed.toFixed(1)} km/h {getWindDirection(weather.windBearing)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropletsIcon className="text-primary hidden size-6 md:block" />
        <div>
          <p className="text-muted-foreground text-sm">Precipitation</p>
          <p className="text-xl font-semibold">{(weather.precipProbability * 100).toFixed(0)}%</p>
        </div>
      </div>
    </Card>
  );
}
