import type { StateStorage } from "zustand/middleware";

const DATABASE_NAME = "nutritrack";
const DATABASE_VERSION = 1;
const STORE_NAME = "app-state";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open the local database."));
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("The local database transaction was aborted."));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("The local database transaction failed."));
  });
}

export const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(name);
    const value = await new Promise<unknown>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Could not read local app data."));
    });

    if (typeof value === "string") return value;

    const legacyValue = window.localStorage.getItem(name);
    if (legacyValue === null) return null;

    await indexedDbStorage.setItem(name, legacyValue);
    window.localStorage.removeItem(name);
    return legacyValue;
  },
  setItem: async (name, value) => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(value, name);
    await waitForTransaction(transaction);
  },
  removeItem: async (name) => {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(name);
    await waitForTransaction(transaction);
  },
};
