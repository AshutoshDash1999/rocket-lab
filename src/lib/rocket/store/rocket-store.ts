import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PlacedPart } from "../canvas";

interface RocketStore {
  /** The rocket as last handed from the builder to the launch pad. */
  parts: PlacedPart[];
  setParts: (parts: PlacedPart[]) => void;
}

/**
 * Hands the built rocket between /build and /launch. Kept in sessionStorage
 * so a refresh on either page keeps it. Hydration is manual (skipHydration)
 * so the server render and the first client render match: call
 * `useRocketStore.persist.rehydrate()` from an effect.
 */
export const useRocketStore = create<RocketStore>()(
  persist(
    (set) => ({
      parts: [],
      setParts: (parts) => set({ parts }),
    }),
    {
      name: "rocket-lab:rocket",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
