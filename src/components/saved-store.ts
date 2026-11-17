"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Saved activities and planned calendar dates.
 * Always kept on the device (works offline and without an account). When a parent is
 * signed in, AccountSync turns on syncing: every change is also sent to the family
 * account, and the account's lists are loaded on start, so all the family's phones match.
 * If storage is unavailable (private mode) the list lives in memory for the session.
 */
const EMPTY: string[] = [];
type ListName = "saved" | "planned";

let syncOn = false;

/** Called by AccountSync once the account lists are loaded (true) or on sign-out (false). */
export function setSyncEnabled(on: boolean) {
  syncOn = on;
}

function pushChange(list: ListName, op: "add" | "remove", value: string) {
  if (!syncOn) return;
  void fetch("/api/me/lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op, list, value }),
    keepalive: true,
  }).catch(() => {
    /* offline: the device copy stays; the next start merges it back */
  });
}

function createStringSetStore(key: string, list: ListName) {
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

  function useStore() {
    const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
    const toggle = useCallback((id: string) => {
      const current = read();
      const has = current.includes(id);
      write(has ? current.filter((x) => x !== id) : [...current, id]);
      pushChange(list, has ? "remove" : "add", id);
    }, []);
    return { ids, toggle };
  }

  return { useStore, read, replace: write };
}

const saved = createStringSetStore("kw.saved.v1", "saved");
const planned = createStringSetStore("mv.planned.v1", "planned");

/** Saved (hearted) activity ids. */
export const useSavedIds = saved.useStore;
/** Planned sessions, encoded with encodePlanned() from domain/calendar. */
export const usePlanned = planned.useStore;

export const deviceLists = {
  read: () => ({ saved: saved.read(), planned: planned.read() }),
  replace: (lists: { saved: string[]; planned: string[] }) => {
    saved.replace(lists.saved);
    planned.replace(lists.planned);
  },
  clear: () => {
    saved.replace(EMPTY);
    planned.replace(EMPTY);
  },
};

// ---------- Family (children + who goes to which planned date) ----------
// Only exists for signed-in parents; loaded by AccountSync, kept in memory.

export interface FamilyChild {
  id: string;
  nickname: string | null;
  birthYear: number;
}
interface FamilyState {
  children: FamilyChild[];
  assignments: Record<string, string[]>;
}
const NO_FAMILY: FamilyState = { children: [], assignments: {} };
let family: FamilyState = NO_FAMILY;
const familyListeners = new Set<() => void>();

export function setFamily(next: FamilyState | null) {
  family = next ?? NO_FAMILY;
  familyListeners.forEach((l) => l());
}

function subscribeFamily(l: () => void) {
  familyListeners.add(l);
  return () => familyListeners.delete(l);
}

export function useFamily() {
  const state = useSyncExternalStore(subscribeFamily, () => family, () => NO_FAMILY);
  const toggleChild = useCallback((key: string, childId: string) => {
    const current = family.assignments[key] ?? [];
    const next = current.includes(childId) ? current.filter((x) => x !== childId) : [...current, childId];
    setFamily({ ...family, assignments: { ...family.assignments, [key]: next } });
    if (!syncOn) return;
    void fetch("/api/me/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "assign", value: key, childIds: next }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return { ...state, toggleChild };
}
