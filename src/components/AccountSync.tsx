"use client";

import { useEffect } from "react";
import { deviceLists, setFamily, setSyncEnabled, type FamilyChild } from "./saved-store";

/** Which account this device last synced with (an opaque id, not personal data). */
const SYNCED_KEY = "mv.syncedAccount.v1";

function getSynced() {
  try {
    return window.localStorage.getItem(SYNCED_KEY);
  } catch {
    return null;
  }
}
function setSynced(v: string | null) {
  try {
    if (v) window.localStorage.setItem(SYNCED_KEY, v);
    else window.localStorage.removeItem(SYNCED_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Keeps Saved and Calendar in step with the family account.
 * - First start after signing in on this device: device items are merged into the account.
 * - Later starts: the account is the source of truth (so removals on another phone stick).
 * - Signed out after being signed in: the device lists are cleared (shared devices).
 */
export function AccountSync({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    let cancelled = false;
    if (!signedIn) {
      setSyncEnabled(false);
      setFamily(null);
      if (getSynced()) {
        deviceLists.clear();
        setSynced(null);
      }
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/me/lists", { cache: "no-store" });
        if (!res.ok) return;
        const server = (await res.json()) as {
          userId: string;
          saved: string[];
          planned: string[];
          children: FamilyChild[];
          assignments: Record<string, string[]>;
        };
        let lists = server;
        if (getSynced() !== server.userId) {
          const merged = await fetch("/api/me/lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ op: "merge", ...deviceLists.read() }),
          });
          if (!merged.ok) return;
          lists = (await merged.json()) as typeof server;
        }
        if (cancelled) return;
        deviceLists.replace({ saved: lists.saved, planned: lists.planned });
        setFamily({ children: lists.children, assignments: lists.assignments });
        setSynced(server.userId);
        setSyncEnabled(true);
      } catch {
        /* offline: keep using the device copy */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);
  return null;
}
