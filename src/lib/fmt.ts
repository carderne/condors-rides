import { format, formatISO } from "date-fns";

export function formatShortDate(date: Date) {
  return format(date, "EEE, d MMM");
}

export function formatFullDate(date: Date) {
  return format(date, "EEE, d MMM yyyy");
}

export function formatISODate(date: Date) {
  return formatISO(date, { representation: "date" });
}

export function formatISODateTime(date: Date) {
  return formatISO(date);
}

export function formatFullDateTime(date: Date) {
  return format(date, "EEE, d MMM yyyy 'at' h:mm a");
}

export function formatTime(time: string | null): string {
  if (!time) {
    return "";
  }
  return time.slice(0, 5);
}

const numberFormatter = new Intl.NumberFormat("en-UK", {});
export function formatNumber(number: number): string {
  return numberFormatter.format(number);
}

export function capitalize(text: string): string {
  const res = text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return res;
}

export function formatStartPoint(text: string): string {
  if (text === "Beeline Bicycles") {
    return "Beeline";
  }

  if (text.match(/-?\d+\.\d+,\s*-?\d+\.\d+/)) {
    return "Click to see";
  }

  return text;
}

export function isHref(text: string): boolean {
  if (text.startsWith("https://")) {
    return true;
  }
  return false;
}

export function formatUrl(url: string): string {
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes("mailto:")) {
    return trimmedUrl;
  }
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  if (url.startsWith("/")) {
    return trimmedUrl;
  }
  return `https://${trimmedUrl}`;
}
