// StorageAdapter.ts — Safe local persistence for browser and preview contexts.
// Some embedded previews expose localStorage as null or deny access. The game
// should continue with in-memory defaults instead of failing initialization.

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readLocal(key: string): string | null {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    getStorage()?.setItem(key, value);
  } catch {
    // Persistence is best-effort; gameplay should never depend on it.
  }
}
