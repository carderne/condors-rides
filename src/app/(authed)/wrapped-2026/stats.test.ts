import { describe, expect, it } from "vitest";
import { archetype, longestWeekStreak, median, timeToMinutes, topEntry, weekOfYear } from "./stats";

const d = (s: string) => new Date(`${s}T00:00:00Z`);

describe("wrapped stats", () => {
  it("weekOfYear is Monday-based", () => {
    // 1 Jan 2026 is a Thursday; Sun 4 Jan is same week, Mon 5 Jan is next.
    expect(weekOfYear(d("2026-01-01"))).toBe(0);
    expect(weekOfYear(d("2026-01-04"))).toBe(0);
    expect(weekOfYear(d("2026-01-05"))).toBe(1);
  });

  it("longestWeekStreak counts consecutive weeks", () => {
    const dates = ["2026-01-05", "2026-01-07", "2026-01-12", "2026-01-19", "2026-02-09"].map(d);
    expect(longestWeekStreak(dates)).toBe(3);
    expect(longestWeekStreak([])).toBe(0);
  });

  it("small helpers", () => {
    expect(timeToMinutes("07:30:00")).toBe(450);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
    expect(topEntry(["a", "b", "a"])).toEqual({ name: "a", count: 2 });
  });

  it("archetype", () => {
    const base = { rides: 20, ridesLed: 0, offroadShare: 0, avgDistance: 60, climbPerKm: 8 };
    expect(archetype({ ...base, ridesLed: 8 }).title).toBe("The Shepherd");
    expect(archetype({ ...base, offroadShare: 0.6 }).title).toBe("The Mud Magnet");
    expect(archetype({ ...base, rides: 0 }).title).toBe("The Ones Who Got Away");
  });
});
