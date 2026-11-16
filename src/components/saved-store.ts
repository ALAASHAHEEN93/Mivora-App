"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Small per-device string-set stores in localStorage, used until family accounts
 * exist (implementation step 6). If storage is unavailable (private mode) the list
 * lives in memory for the session.
 */
const EMPTY: string[] = [];

function createStringSetStore(key: string) {
  let memory: string[] = EMPTY;
  let cache: { raw: string | null; ids: string[] } = { raw: null, ids: EMPTY };
  const listeners = new Set<() => void>();

  function read(): string[] {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === cache.raw) return cache.ids;
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const ids = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
      cache = { raw, ids };
      return ids;
    } catch {
      return memory;
    }
  }

  function write(ids: string[]) {
    memory = ids;
    try {
      window.localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      /* storage unavailable — memory fallback is used */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === key && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return function useStore() {
    const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
    const toggle = useCallback((id: string) => {
      const current = read();
      write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    }, []);
    return { ids, toggle };
  };
}

/** Saved (hearted) activity ids. */
export const useSavedIds = createStringSetStore("kw.saved.v1");

/** Planned sessions, encoded with encodePlanned() from domain/calendar. */
export const usePlanned = createStringSetStore("mv.planned.v1");
