import type { BackupFile, PersistedState } from "@/types";

export function formatMl(ml: number): string {
  if (ml >= 1000) {
    const litres = ml / 1000;
    return `${litres % 1 === 0 ? litres : litres.toFixed(1)} L`;
  }
  return `${Math.round(ml)} ml`;
}

/** Metric -> imperial-friendly label for food weight. */
export function formatGrams(grams: number, units: "metric" | "imperial" = "metric"): string {
  if (units === "imperial") {
    return `${(grams / 28.3495).toFixed(1)} oz`;
  }
  return `${Math.round(grams)} g`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural ?? `${singular}s`}`;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function downloadBackup(state: PersistedState) {
  const payload: BackupFile = {
    app: "nutritrack",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nutritrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsText(file);
  });
}
