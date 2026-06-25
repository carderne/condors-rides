import { formatISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

// All human-readable timestamps are rendered in UK local time so that they are
// consistent regardless of whether formatting happens on the server (UTC) or in
// the user's browser. Date-only values (slugs, ISO date keys) are intentionally
// left in `formatISO*` below, since they represent calendar days, not instants.
const TIME_ZONE = "Europe/London";

export function formatShortDate(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "EEE, d MMM");
}

export function formatShortDateYear(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "d MMM yyyy");
}

export function formatShortDateTime(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "EEE, d MMM, h:mm a");
}

export function formatFullDate(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "EEE, d MMM yyyy");
}

export function formatISODate(date: Date) {
  return formatISO(date, { representation: "date" });
}

export function formatISODateTime(date: Date) {
  return formatISO(date);
}

export function formatFullDateTime(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "EEE, d MMM yyyy 'at' h:mm a");
}

export function formatTime(time: string | null): string {
  if (!time) {
    return "";
  }
  return time.slice(0, 5);
}

export function capitalize(text: string): string {
  const res = text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return res;
}

export function camelToSentence(input: string): string {
  const withSpaces = input.replace(/([A-Z])/g, " $1");
  const result = withSpaces.toLowerCase();
  return result;
}

export function formatRideName(text: string): string {
  if (text.length > 40) {
    return text.slice(0, 40) + "...";
  }

  return text;
}

export function formatStartPoint(text: string): string {
  if (text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/)) {
    return "Click to see";
  }

  if (text.length > 20) {
    return text.slice(0, 20) + "...";
  }

  return text;
}

export function isHref(text: string): boolean {
  if (text.startsWith("https://")) {
    return true;
  }
  return false;
}
