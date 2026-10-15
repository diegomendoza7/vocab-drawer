import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "../lib/storage.js";
import {
  createProgress,
  migrateProgress,
  mergeBackup,
  PROGRESS_KEY,
} from "../lib/progress.js";
import { scheduleResults } from "../lib/study.js";

export function recoverSession(progress) {
  const session = progress.pendingSession;
  if (!session?.id || progress.committedSessions?.[session.id])
    return { ...progress, pendingSession: null };
  const valid = (session.results || []).filter(
    ([id, row]) =>
      typeof id === "string" &&
      id.startsWith(`${session.lang}:`) &&
      (row?.word?.t || row?.conj === true),
  );
  const { cards } = scheduleResults(progress.cards, valid);
  return {
    ...progress,
    cards,
    pendingSession: null,
    committedSessions: {
      ...progress.committedSessions,
      [session.id]: Date.now(),
    },
  };
}

export function useProgress(snapshotSession) {
  const [progress, rawSet] = useState(createProgress);
  const [readOnly, setReadOnly] = useState(false);
  const lastSaved = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setStatus] = useState("loading");
  const [recovered, setRecovered] = useState(0);
  const [saveTick, setTick] = useState(0);
  const writeChain = useRef(Promise.resolve()),
    version = useRef(0);
  const writeEnabled = useRef(false);
  useEffect(() => {
    let active = true,
      release;
    const lifetime = new Promise((resolve) => {
      release = resolve;
    });
    async function load(canWrite) {
      try {
        const stored = await storage.get(PROGRESS_KEY);
        const raw = stored?.value ?? null;
        const value = migrateProgress(raw ? JSON.parse(raw) : null);
        if (!active) return;
        lastSaved.current = raw;
        writeEnabled.current = canWrite;
        rawSet(canWrite ? recoverSession(value) : value);
        setReadOnly(!canWrite);
        setRecovered(canWrite ? value.pendingSession?.results?.length || 0 : 0);
        setStatus(canWrite ? "saved" : "read-only");
      } catch (error) {
        console.error("[storage]", error.message);
        if (active) setStatus("failed");
      }
      if (active) setLoaded(true);
    }
    if (navigator.locks?.request) {
      // Deferring until after the mount remains active avoids acquiring a lease
      // for React StrictMode’s immediately discarded effect.
      Promise.resolve()
        .then(() => {
          if (!active) return;
          return navigator.locks.request(
            PROGRESS_KEY + ":writer",
            { ifAvailable: true },
            async (lock) => {
              if (!active) return;
              await load(Boolean(lock));
              if (lock) await lifetime;
            },
          );
        })
        .catch(async () => {
          if (active) await load(true);
        });
    } else load(true);
    return () => {
      active = false;
      release();
      writeEnabled.current = false;
    };
  }, []);
  useEffect(() => {
    if (!loaded || !writeEnabled.current) return;
    const revision = ++version.current;
    setStatus("saving");
    writeChain.current = writeChain.current
      .catch(() => {})
      .then(async () => {
        if (!writeEnabled.current) return;
        try {
          const next = JSON.stringify(progress);
          const written = await storage.compareAndSet(
            PROGRESS_KEY,
            lastSaved.current,
            next,
          );
          if (!written) {
            writeEnabled.current = false;
            setReadOnly(true);
            setStatus("read-only");
            return;
          }
          lastSaved.current = next;
          if (revision === version.current) setStatus("saved");
        } catch (error) {
          console.error("[storage] save failed:", error.message);
          if (revision === version.current) setStatus("failed");
        }
      });
  }, [progress, loaded, saveTick]);
  const setProgress = (update) => {
    if (readOnly) return;
    const pending = snapshotSession?.();
    rawSet((previous) => {
      const next = typeof update === "function" ? update(previous) : update;
      if (next === previous) return previous;
      return {
        ...next,
        pendingSession: pending?.results?.length ? pending : null,
      };
    });
  };
  const retrySave = useCallback(async () => {
    if (!writeEnabled.current) {
      try {
        const stored = await storage.get(PROGRESS_KEY);
        const value = migrateProgress(
          stored?.value ? JSON.parse(stored.value) : null,
        );
        lastSaved.current = stored?.value ?? null;
        writeEnabled.current = true;
        rawSet((p) => mergeBackup(value, p).progress);
      } catch {
        setStatus("failed");
        return;
      }
    }
    setTick((n) => n + 1);
  }, []);
  return {
    progress,
    setProgress,
    progressLoaded: loaded,
    readOnly,
    saveStatus,
    storageOn: saveStatus === "loading" ? null : saveStatus !== "failed",
    retrySave,
    recovered,
  };
}
