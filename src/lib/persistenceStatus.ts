export type PersistenceStatus =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "error"; message: string };

let status: PersistenceStatus = { state: "loading" };
const listeners = new Set<() => void>();

export function getPersistenceStatus(): PersistenceStatus {
  return status;
}

export function subscribePersistenceStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reportPersistenceStatus(next: PersistenceStatus): void {
  status = next;
  listeners.forEach((listener) => listener());
}
