import { describe, expect, it } from "vitest";
import {
  archetype,
  longestWeekStreak,
  median,
  PERIOD_END,
  periodEnd,
  rankPosition,
  rideStart,
  timeToMinutes,
  topEntry,
  topEntryLoose,
  weekOfYear,
} from "./stats";

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

  it("weekOfYear covers the partial last week", () => {
    expect(weekOfYear(d("2026-12-31"))).toBe(52);
  });

  it("periodEnd includes today (UK) and caps at year end", () => {
    expect(periodEnd(new Date("2026-11-26T15:00:00Z"))).toEqual(d("2026-11-27"));
    // 23:30 UTC on 30 Jun is already 1 Jul in London (BST)
    expect(periodEnd(new Date("2026-06-30T23:30:00Z"))).toEqual(d("2026-07-02"));
    expect(periodEnd(new Date("2027-03-01T12:00:00Z"))).toEqual(PERIOD_END);
  });

  it("rideStart interprets time as UK local", () => {
    expect(rideStart(d("2026-01-10"), "08:00:00").toISOString()).toBe("2026-01-10T08:00:00.000Z");
    expect(rideStart(d("2026-07-10"), "08:00:00").toISOString()).toBe("2026-07-10T07:00:00.000Z");
  });

  it("rankPosition shares ties", () => {
    const scores = [40, 30, 30, 10];
    expect(rankPosition(scores, 40)).toBe(1);
    expect(rankPosition(scores, 30)).toBe(2);
    expect(rankPosition(scores, 10)).toBe(4);
    expect(rankPosition(scores, 0)).toBe(5);
  });

  it("topEntryLoose ignores case and whitespace, keeps common spelling", () => {
    expect(topEntryLoose(["Café X", "café x ", "Café X", "Other", null, " "])).toEqual({
      name: "Café X",
      count: 3,
    });
    expect(topEntryLoose([null, ""])).toBeNull();
  });

  it("archetype", () => {
    const base = {
      rides: 20,
      ridesLed: 0,
      offroadShare: 0,
      races: 0,
      avgDistance: 60,
      climbPerKm: 7,
      topCafeVisits: 1,
      medianStartMins: 9 * 60,
      weekendShare: 0.5,
    };
    expect(archetype({ ...base, rides: 0 }).title).toBe("The Ones Who Got Away");
    expect(archetype({ ...base, rides: 3, offroadShare: 1 }).title).toBe("The Cameo");
    expect(archetype({ ...base, ridesLed: 8 }).title).toBe("The Shepherd");
    expect(archetype({ ...base, offroadShare: 0.6 }).title).toBe("The Mud Magnet");
    expect(archetype({ ...base, races: 4 }).title).toBe("The Racer");
    expect(archetype({ ...base, rides: 5, races: 1 }).title).toBe("The Club Regular");
    expect(archetype({ ...base, climbPerKm: 9.5 }).title).toBe("The Mountain Goat");
    expect(archetype({ ...base, avgDistance: 85 }).title).toBe("The Long Hauler");
    expect(archetype({ ...base, rides: 45 }).title).toBe("The Ever-Present");
    expect(archetype({ ...base, topCafeVisits: 5 }).title).toBe("The Café Connoisseur");
    expect(archetype({ ...base, medianStartMins: 18 * 60 }).title).toBe("The Night Shift");
    expect(archetype({ ...base, weekendShare: 0.8 }).title).toBe("The Weekend Warrior");
    expect(archetype(base).title).toBe("The Club Regular");
  });
});
