"use client";

import { useSyncExternalStore } from "react";

const EVENT = "tb:store";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function removeStore(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** Raw stored string, `null` on the server and during hydration. */
export function useStoredRaw(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readStore(key),
    () => null,
  );
}

/** `false` on the server / first render, `true` once hydrated. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
