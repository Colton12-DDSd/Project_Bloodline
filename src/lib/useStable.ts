"use client";

import { useEffect, useMemo, useState } from "react";
import type { Horse, StableState } from "@/types/bloodline";
import { breedHorses } from "./breeding";
import { createSeedHorses } from "./seed";

const STORAGE_KEY = "project-bloodline-stable-v1";

export function useStable() {
  const [state, setState] = useState<StableState>({ horses: [] });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved) as StableState);
      } else {
        setState({ horses: createSeedHorses() });
      }
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [isReady, state]);

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

  return {
    horses: state.horses,
    sortedHorses,
    lastFoalId: state.lastFoalId,
    isReady,
    getHorse,
    createFoal,
    resetStable,
  };
}
