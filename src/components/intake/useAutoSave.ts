"use client";

import { useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T extends Record<string, unknown>>(
  intakeId: string,
  initial: T,
  delayMs = 2000,
) {
  const [values, setValues] = useState<T>(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lastSavedRef = useRef<T>(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function set<K extends keyof T>(key: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("idle");
    timerRef.current = setTimeout(() => {
      void flush();
    }, delayMs);
  }

  async function flush() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (inFlightRef.current) {
      await inFlightRef.current;
    }

    const delta: Record<string, unknown> = {};
    const last = lastSavedRef.current as Record<string, unknown>;
    const current = valuesRef.current as Record<string, unknown>;
    for (const key of Object.keys(current)) {
      if (current[key] !== last[key]) {
        delta[key] = current[key];
      }
    }
    if (Object.keys(delta).length === 0) return;

    setStatus("saving");
    setErrorMsg(null);

    const snapshot = { ...current } as T;
    const promise = (async () => {
      try {
        const res = await fetch(`/api/intakes/${intakeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(delta),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`PATCH ${res.status} ${t.slice(0, 120)}`);
        }
        lastSavedRef.current = snapshot;
        setStatus("saved");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Onbekende fout");
      }
    })();
    inFlightRef.current = promise;
    await promise;
    inFlightRef.current = null;
  }

  // keep a ref to the latest values so flush sees current
  const valuesRef = useRef<T>(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  return { values, set, status, errorMsg, flush };
}
