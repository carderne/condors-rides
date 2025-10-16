import { getConfig } from "@/lib/config";
import type { Result } from "@/types/result";
import { closestIndexTo, isBefore } from "date-fns";

interface CurrentlyDataPoint {
  time: number;
  summary?: string;
  icon?: string;
  nearestStormDistance?: number;
  nearestStormBearing?: number;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError?: number;
  precipType: string;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  windBearing: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  ozone: number;
  smoke?: number;
  fireIndex?: number;
  feelsLike?: number;
  currentDayIce?: number;
  currentDayLiquid?: number;
  currentDaySnow?: number;
  stationPressure?: number;
}

interface HourlyDataPoint {
  time: number;
  summary?: string;
  icon?: string;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError?: number;
  precipAccumulation?: number;
  precipType: string;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  stationPressure?: number;
  windSpeed: number;
  windGust: number;
  windBearing: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  ozone: number;
  smoke?: number;
  liquidAccumulation?: number;
  snowAccumulation?: number;
  iceAccumulation?: number;
  nearestStormDistance?: number;
  nearestStormBearing?: number;
  fireIndex?: number;
  feelsLike?: number;
}

interface DailyDataPoint {
  time: number;
  summary?: string;
  icon?: string;
  dawnTime?: number;
  sunriseTime: number;
  sunsetTime: number;
  duskTime?: number;
  moonPhase: number;
  precipIntensity: number;
  precipIntensityMax: number;
  precipIntensityMaxTime: number;
  precipProbability: number;
  precipAccumulation?: number;
  precipType: string;
  temperatureHigh: number;
  temperatureHighTime: number;
  temperatureLow: number;
  temperatureLowTime: number;
  apparentTemperatureHigh: number;
  apparentTemperatureHighTime: number;
  apparentTemperatureLow: number;
  apparentTemperatureLowTime: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  windGustTime: number;
  windBearing: number;
  cloudCover: number;
  uvIndex: number;
  uvIndexTime: number;
  visibility: number;
  temperatureMin: number;
  temperatureMinTime: number;
  temperatureMax: number;
  temperatureMaxTime: number;
  apparentTemperatureMin: number;
  apparentTemperatureMinTime: number;
  apparentTemperatureMax: number;
  apparentTemperatureMaxTime: number;
  smokeMax?: number;
  smokeMaxTime?: number;
  liquidAccumulation?: number;
  snowAccumulation?: number;
  iceAccumulation?: number;
  fireIndexMax?: number;
  fireIndexMaxTime?: number;
}

interface HourlyBlock {
  summary?: string;
  icon?: string;
  data: HourlyDataPoint[];
}

interface DailyBlock {
  summary?: string;
  icon?: string;
  data: DailyDataPoint[];
}

interface PirateWeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  offset: number;
  elevation: number;
  currently?: CurrentlyDataPoint;
  minutely?: unknown;
  hourly?: HourlyBlock;
  daily?: DailyBlock;
  alerts?: unknown[];
  flags: unknown;
}

const {
  pirateWeather: { apiKey },
} = getConfig();

const BASE_URL = "https://api.pirateweather.net";

async function getForecast({
  lon,
  lat,
}: {
  lon: number;
  lat: number;
}): Promise<Result<{ daily: WeatherData[]; hourly: WeatherData[] }, string>> {
  const path = `/forecast/${apiKey}/${lat},${lon}?units=ca&exclude=currently,minutely,alerts,summary`;
  const url = new URL(path, BASE_URL).toString();
  const response = await fetch(url);

  if (!response.ok) {
    return { ok: false, error: response.status.toString() };
  }

  const data = (await response.json()) as PirateWeatherResponse;
  const { daily: dailyRaw, hourly: hourlyRaw } = data;

  const daily =
    dailyRaw?.data.map(
      ({ time, windSpeed, windBearing, apparentTemperatureHigh, precipProbability }) => ({
        time: new Date(time * 1000),
        windSpeed,
        windBearing,
        apparentTemperature: apparentTemperatureHigh,
        precipProbability,
      }),
    ) ?? [];
  const hourly =
    hourlyRaw?.data.map(
      ({ time, windSpeed, windBearing, apparentTemperature, precipProbability }) => ({
        time: new Date(time * 1000),
        windSpeed,
        windBearing,
        apparentTemperature,
        precipProbability,
      }),
    ) ?? [];
  return { ok: true, data: { daily, hourly } };
}

export interface WeatherData {
  time: Date;
  windSpeed: number;
  windBearing: number;
  apparentTemperature: number;
  precipProbability: number;
}

export async function getForecaseForTime({
  lat,
  lon,
  datetime,
}: {
  lat: number;
  lon: number;
  datetime: Date;
}): Promise<Result<WeatherData, string>> {
  const forecast = await getForecast({ lat, lon });
  if (!forecast.ok) {
    return forecast;
  }
  const {
    data: { hourly, daily },
  } = forecast;

  // If our date is before the last hourly forecast
  const lastHourly = hourly.at(-1);
  if (lastHourly && isBefore(datetime, lastHourly.time)) {
    const closestHourlyIndex = closestIndexTo(
      datetime,
      hourly.map(({ time }) => time),
    );
    if (closestHourlyIndex !== undefined) {
      const result = hourly[closestHourlyIndex]!;
      return { ok: true, data: result };
    }
  }

  // If our date is before the last daily forecast
  const lastDaily = daily.at(-1);
  if (lastDaily && isBefore(datetime, lastDaily.time)) {
    const closestDailyIndex = closestIndexTo(
      datetime,
      daily.map(({ time }) => time),
    );
    if (closestDailyIndex !== undefined) {
      const result = daily[closestDailyIndex]!;
      return { ok: true, data: result };
    }
  }

  return { ok: false, error: "No forecast available" };
}
