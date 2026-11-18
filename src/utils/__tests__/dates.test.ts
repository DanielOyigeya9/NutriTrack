import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  fromDayKey,
  isFuture,
  isToday,
  lastNDays,
  toDayKey,
  todayKey,
} from "../dates";

describe("date utilities", () => {
  it("converts Date to local day key and parses back correctly", () => {
    const key = "2026-11-15";
    const date = fromDayKey(key);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10); // 0-indexed November
    expect(date.getDate()).toBe(15);
    expect(toDayKey(date)).toBe(key);
  });

  it("adds and subtracts days without drifting", () => {
    expect(addDays("2026-11-15", 1)).toBe("2026-11-16");
    expect(addDays("2026-11-15", -5)).toBe("2026-11-10");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("calculates days between two keys", () => {
    expect(daysBetween("2026-11-10", "2026-11-15")).toBe(5);
    expect(daysBetween("2026-11-15", "2026-11-15")).toBe(0);
    expect(daysBetween("2026-11-15", "2026-11-14")).toBe(-1);
  });

  it("generates ascending last N days list", () => {
    const list = lastNDays(3, "2026-11-15");
    expect(list).toEqual(["2026-11-13", "2026-11-14", "2026-11-15"]);
  });

  it("detects current and future dates", () => {
    const today = todayKey();
    expect(isToday(today)).toBe(true);
    expect(isFuture(addDays(today, 1))).toBe(true);
    expect(isFuture(addDays(today, -1))).toBe(false);
  });
});
