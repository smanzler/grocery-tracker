import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HouseholdStoreState = {
  householdId: string | null;
  selectHousehold: (householdId: string | null) => void;
};

export const useHouseholdStore = create<HouseholdStoreState>()(
  persist(
    (set) => ({
      householdId: null,
      selectHousehold: (householdId: string | null) => {
        set({ householdId });
      },
    }),
    {
      name: "household-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
