// Pure helpers for Wrapped 2026 — no DB access so they're easy to test.

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// Ride dates/times are entered in UK local time.
const TIME_ZONE = "Europe/London";

export const YEAR = 2026;
// Calendar year, same as Wrapped 2025, so year-on-year comparisons line up.
export const PERIOD_START = new Date(Date.UTC(YEAR, 0, 1));
export const PERIOD_END = new Date(Date.UTC(YEAR + 1, 0, 1));
export const PREV_PERIOD_START = new Date(Date.UTC(YEAR - 1, 0, 1));

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Exclusive upper bound on ride dates: rides up to and including today (UK),
 * capped at the end of the period. Ride dates are UTC-midnight `Date`s.
 */
export function periodEnd(now: Date): Date {
  const today = new Date(`${formatInTimeZone(now, TIME_ZONE, "yyyy-MM-dd")}T00:00:00Z`);
  const tomorrow = new Date(today.getTime() + DAY_MS);
  return tomorrow < PERIOD_END ? tomorrow : PERIOD_END;
}

/** Ride start as a real instant: date (UTC midnight) + "HH:MM:SS" in UK local time. */
export function rideStart(date: Date, time: string): Date {
  return fromZonedTime(`${date.toISOString().slice(0, 10)}T${time}`, TIME_ZONE);
}

/** 1-based rank where ties share a position (1 + number of strictly better scores). */
export function rankPosition(scores: number[], mine: number): number {
  return 1 + scores.filter((n) => n > mine).length;
}
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Monday-based week index within the year (0..52). */
export function weekOfYear(date: Date): number {
  const jan1 = Date.UTC(date.getUTCFullYear(), 0, 1);
  const offset = (new Date(jan1).getUTCDay() + 6) % 7;
  const dayOfYear = Math.floor((date.getTime() - jan1) / DAY_MS);
  return Math.floor((dayOfYear + offset) / 7);
}

/** Longest run of consecutive weeks containing at least one ride. */
export function longestWeekStreak(dates: Date[]): number {
  const weeks = [...new Set(dates.map(weekOfYear))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev = -2;
  for (const w of weeks) {
    run = w === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = w;
  }
  return best;
}

/** "HH:MM:SS" -> minutes after midnight. */
export function timeToMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function topEntry<T extends string>(items: T[]): { name: T; count: number } | null {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  let best: { name: T; count: number } | null = null;
  for (const [name, count] of counts) {
    if (!best || count > best.count) best = { name, count };
  }
  return best;
}

/**
 * Like topEntry, but trims and ignores case when counting ("Café X" == "café x ").
 * Returns the most common original spelling of the winning entry.
 */
export function topEntryLoose(items: (string | null | undefined)[]): {
  name: string;
  count: number;
} | null {
  const spellings = new Map<string, string[]>();
  for (const raw of items) {
    const item = raw?.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    spellings.set(key, [...(spellings.get(key) ?? []), item]);
  }
  let best: { name: string; count: number } | null = null;
  for (const variants of spellings.values()) {
    if (!best || variants.length > best.count) {
      best = { name: topEntry(variants)!.name, count: variants.length };
    }
  }
  return best;
}

export type Chronotype = { label: string; emoji: string; blurb: string };

export function chronotype(medianStart: number): Chronotype {
  if (medianStart < 8 * 60) {
    return { label: "Dawn Patrol", emoji: "🌅", blurb: "Rolling out before most people wake up." };
  }
  if (medianStart < 10 * 60) {
    return { label: "Morning Regular", emoji: "☕", blurb: "Classic club-run hours." };
  }
  if (medianStart < 17 * 60) {
    return { label: "Daytripper", emoji: "🌤️", blurb: "No alarm clocks for you." };
  }
  return { label: "Night Rider", emoji: "🌙", blurb: "Lights on, evening miles." };
}

export type Planner = { label: string; blurb: string };

export function plannerType(medianLeadHours: number): Planner {
  if (medianLeadHours < 24) {
    return { label: "Last-Minute Legend", blurb: "Why plan when you can just turn up?" };
  }
  if (medianLeadHours < 24 * 4) {
    return { label: "A Few Days Out", blurb: "Check the forecast, then commit." };
  }
  return { label: "Master Planner", blurb: "Your calendar is booked weeks ahead." };
}

export type Archetype = { title: string; emoji: string };

/**
 * First match wins. Thresholds tuned on 2026 prod data (riders with 6+ rides):
 * the rarer / more distinctive traits come first, then the broad "when do you
 * ride" splits (the club divides fairly cleanly into weekday-evening and
 * weekend-morning riders), then a fallback.
 */
export function archetype(args: {
  rides: number;
  ridesLed: number;
  offroadShare: number;
  races: number;
  avgDistance: number;
  climbPerKm: number;
  topCafeVisits: number;
  medianStartMins: number | null;
  weekendShare: number;
}): Archetype {
  const { rides, ridesLed, offroadShare, races, avgDistance, climbPerKm } = args;
  const { topCafeVisits, medianStartMins, weekendShare } = args;
  if (rides === 0) return { title: "The Ones Who Got Away", emoji: "👻" };
  // Too few rides for any trait to mean much.
  if (rides < 4) return { title: "The Cameo", emoji: "🎬" };
  if (ridesLed >= 5 && ridesLed / rides >= 0.3) return { title: "The Shepherd", emoji: "🐑" };
  if (offroadShare >= 0.5) return { title: "The Mud Magnet", emoji: "🌲" };
  if (races >= 2 && races / rides >= 0.2) return { title: "The Racer", emoji: "🏁" };
  if (climbPerKm >= 9) return { title: "The Mountain Goat", emoji: "🐐" };
  if (avgDistance >= 80) return { title: "The Long Hauler", emoji: "🛣️" };
  if (rides >= 40) return { title: "The Ever-Present", emoji: "📍" };
  if (topCafeVisits >= 4) return { title: "The Café Connoisseur", emoji: "🥐" };
  if (medianStartMins !== null && medianStartMins >= 17 * 60) {
    return { title: "The Night Shift", emoji: "🌆" };
  }
  if (weekendShare >= 0.7) return { title: "The Weekend Warrior", emoji: "⚔️" };
  return { title: "The Club Regular", emoji: "🚲" };
}

export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}
