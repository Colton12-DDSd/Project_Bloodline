"use client";

import { useEffect, useMemo, useState } from "react";
import type { Horse, StableState } from "@/types/bloodline";
import { breedHorses } from "./breeding";
import { createSeedHorses } from "./seed";
import { loadCloudStable, saveCloudStable } from "./stableCloud";

const STABLE_ID_KEY = "project-bloodline-stable-id-v1";
const STORAGE_KEY_PREFIX = "project-bloodline-stable-v5";

type SyncStatus = "loading" | "local" | "saving" | "synced" | "error";

export function useStable() {
  const [state, setState] = useState<StableState>({ horses: [] });
  const [stableId, setStableId] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [syncError, setSyncError] = useState("");

  const sortedHorses = useMemo(
    () =>
      [...state.horses].sort((a, b) => {
        const aRank = a.trialResults?.overallRank ?? 999;
        const bRank = b.trialResults?.overallRank ?? 999;
        return aRank - bRank || a.name.localeCompare(b.name);
      }),
    [state.horses],
  );

  function resetStable() {
    setState({ horses: createSeedHorses() });
  }

  async function switchStable(nextStableId: string) {
    const normalizedId = normalizeStableId(nextStableId);
    if (!normalizedId) return;

    window.localStorage.setItem(STABLE_ID_KEY, normalizedId);
    setIsReady(false);
    setSyncStatus("loading");
    await loadStable(normalizedId);
  }

  function createFoal(sireId: string, damId: string): Horse {
    const sire = state.horses.find((horse) => horse.id === sireId);
    const dam = state.horses.find((horse) => horse.id === damId);

    if (!sire || !dam) {
      throw new Error("Choose one sire and one dam.");
    }

    const foal = breedHorses(sire, dam, state.horses);
    setState((current) => ({
      horses: current.horses.map((horse) => {
        if (horse.id === sire.id || horse.id === dam.id) {
          return { ...horse, offspringIds: [...horse.offspringIds, foal.id] };
        }
        return horse;
      }).concat(foal),
      lastFoalId: foal.id,
    }));
    return foal;
  }

  function getHorse(id: string): Horse | undefined {
    return state.horses.find((horse) => horse.id === id);
  }

  async function loadStable(id: string) {
    setStableId(id);
    setSyncError("");

    const localStable = readLocalStable(id);
    if (localStable) {
      setState(localStable);
      setSyncStatus("local");
    }

    try {
      const cloudStable = await loadCloudStable(id);
      if (hasHorses(cloudStable)) {
        setState(cloudStable);
        writeLocalStable(id, cloudStable);
        setSyncStatus("synced");
      } else {
        const repairedStable = hasHorses(localStable) ? localStable : { horses: createSeedHorses() };
        setState(repairedStable);
        writeLocalStable(id, repairedStable);
        await saveCloudStable(id, repairedStable);
        setSyncStatus("synced");
      }
    } catch (error) {
      if (!localStable) {
        const seedStable = { horses: createSeedHorses() };
        setState(seedStable);
        writeLocalStable(id, seedStable);
      }
      setSyncStatus("error");
      setSyncError(error instanceof Error ? error.message : "Unable to sync stable.");
    } finally {
      setIsReady(true);
    }
  }

  async function saveStable(id: string, nextState: StableState) {
    writeLocalStable(id, nextState);
    setSyncStatus("saving");
    setSyncError("");

    try {
      await saveCloudStable(id, nextState);
      setSyncStatus("synced");
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error instanceof Error ? error.message : "Unable to sync stable.");
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadStable(getOrCreateStableId());
    });
  }, []);

  useEffect(() => {
    if (!isReady || !stableId) return;

    const timeoutId = window.setTimeout(() => {
      queueMicrotask(() => {
        void saveStable(stableId, state);
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [isReady, stableId, state]);

  return {
    horses: state.horses,
    sortedHorses,
    lastFoalId: state.lastFoalId,
    stableId,
    syncStatus,
    syncError,
    isReady,
    getHorse,
    createFoal,
    resetStable,
    switchStable,
  };
}

function getOrCreateStableId(): string {
  const existingId = window.localStorage.getItem(STABLE_ID_KEY);
  if (existingId) return existingId;

  const createdId = `stable-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(STABLE_ID_KEY, createdId);
  return createdId;
}

function normalizeStableId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
}

function storageKey(stableId: string): string {
  return `${STORAGE_KEY_PREFIX}:${stableId}`;
}

function readLocalStable(stableId: string): StableState | undefined {
  const saved = window.localStorage.getItem(storageKey(stableId));
  return saved ? (JSON.parse(saved) as StableState) : undefined;
}

function writeLocalStable(stableId: string, state: StableState) {
  window.localStorage.setItem(storageKey(stableId), JSON.stringify(state));
}

function hasHorses(state: StableState | undefined): state is StableState {
  return Boolean(state?.horses.length);
}
