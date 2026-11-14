import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PlacedPart } from "../canvas";

interface RocketStore {
  /** The rocket as last handed from the builder to the launch pad. */
  parts: PlacedPart[];
  /** Where the launch pad's "back" buttons go: the builder or share page it came from. */
  returnTo: string;
  setParts: (parts: PlacedPart[], returnTo: string) => void;
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
      returnTo: "/blueprints",
      setParts: (parts, returnTo) => set({ parts, returnTo }),
    }),
    {
      name: "rocket-lab:rocket",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
