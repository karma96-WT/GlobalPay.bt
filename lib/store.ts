'use client';
import { useState, useEffect, useCallback } from 'react';

const EVENT = 'gp-store';

/** Read a JSON value from localStorage (falls back to `init`). */
export function read<T>(key: string, init: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : init;
  } catch {
    return init;
  }
}

/** Write a value and tell every mounted hook in this tab to refresh. */
export function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

/**
 * Prototype stand-in for a backend: state kept in localStorage, shared by
 * every component and kept in sync across components and browser tabs.
 */
export function useStore<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(init);

  useEffect(() => {
    const load = () => setValue(read(key, init));
    const onLocal = (e: Event) => (e as CustomEvent).detail === key && load();
    const onOther = (e: StorageEvent) => e.key === key && load();
    load();
    window.addEventListener(EVENT, onLocal);
    window.addEventListener('storage', onOther);
    return () => {
      window.removeEventListener(EVENT, onLocal);
      window.removeEventListener('storage', onOther);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((p: T) => T)) => {
      const current = read(key, init);
      write(key, typeof next === 'function' ? (next as (p: T) => T)(current) : next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set];
}
