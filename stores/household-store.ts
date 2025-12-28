import "expo-sqlite/localStorage/install";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HouseholdStoreState = {
  householdId: string | null;
  selectHousehold: (householdId: string) => void;
};

const localStorageAdapter = {
  getItem: (name: string): string | null => {
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useHouseholdStore = create<HouseholdStoreState>()(
  persist(
    (set, get) => ({
      householdId: null,
      selectHousehold: (householdId: string) => {
        set({ householdId });
      },
    }),
    {
      name: "household-storage",
      storage: createJSONStorage(() => localStorageAdapter),
    }
  )
);