/** Local-day helpers. Dates are always represented as local "YYYY-MM-DD" keys. */

const pad = (n: number) => String(n).padStart(2, "0");

/** Convert a Date to a local day key (never UTC, so evenings don't shift a day). */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

/** Parse a "YYYY-MM-DD" key into a local Date at midnight. */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, amount: number): string {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + amount);
  return toDayKey(date);
}

export function shiftDayKey(key: string, amount: number): string {
  return addDays(key, amount);
}

/** Whole days between two day keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const start = fromDayKey(a).getTime();
  const end = fromDayKey(b).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** Ascending list of the last `count` day keys, ending with `endKey`. */
export function lastNDays(count: number, endKey: string = todayKey()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(addDays(endKey, -i));
  }
  return keys;
}

export function isFuture(key: string): boolean {
  return key > todayKey();
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

/** Monday-based start of week. */
export function startOfWeek(key: string): string {
  const date = fromDayKey(key);
  const day = (date.getDay() + 6) % 7;
  return addDays(key, -day);
}

export function formatShort(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatLong(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatRelativeLabel(key: string): string {
  if (isToday(key)) return "Today";
  if (key === addDays(todayKey(), -1)) return "Yesterday";
  if (key === addDays(todayKey(), 1)) return "Tomorrow";
  return formatShort(key);
}

/** Weekday initial, e.g. "M". */
export function weekdayInitial(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, { weekday: "narrow" });
}

export function monthInitial(key: string): string {
  return fromDayKey(key).toLocaleDateString(undefined, { month: "short" });
}

/** Time-of-day greeting key. */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Sensible meal type for the current clock. */
export function mealForNow(date: Date = new Date()) {
  const h = date.getHours();
  if (h < 11) return "Breakfast" as const;
  if (h < 16) return "Lunch" as const;
  if (h < 21) return "Dinner" as const;
  return "Snack" as const;
}

export function minutesSinceMidnight(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}
