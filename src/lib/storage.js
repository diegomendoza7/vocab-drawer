/* Persistent key/value store.
 *
 * Replaces the `window.storage` object the Claude artifact host used to inject.
 * That object does not exist outside the artifact sandbox, and the original
 * code degraded *silently* to an in-memory fallback when it was missing —
 * every SRS review history was lost on reload with no error.
 *
 * IndexedDB rather than localStorage: localStorage caps at ~5MB and stores
 * strings only. Once vocabulary is generated on demand and cached forever,
 * the progress blob is expected to outgrow that.
 *
 * The API deliberately mirrors the shape the app already calls:
 *   await storage.get(key) -> { value } | null
 *   await storage.set(key, value)
 */

const DB_NAME = "vocabdrawer";
const DB_VERSION = 1;
const STORE = "kv";

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB blocked by another tab"));
  });

  // Don't cache a rejected promise — a transient failure would otherwise
  // poison every later call for the lifetime of the page.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

function tx(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

export const storage = {
  async get(key) {
    const value = await tx("readonly", (s) => s.get(key));
    return value === undefined ? null : { value };
  },

  async set(key, value) {
    await tx("readwrite", (s) => s.put(value, key));
    return true;
  },

  async remove(key) {
    await tx("readwrite", (s) => s.delete(key));
    return true;
  },
};

/** True when persistence is actually working, not merely present. */
export async function storageAvailable() {
  try {
    const probe = "__probe__";
    await storage.set(probe, "1");
    await storage.remove(probe);
    return true;
  } catch {
    return false;
  }
}
