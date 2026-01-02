import { create } from "zustand";

type PendingIntent = {
  type: "join-household" | "update-password";
  token: string;
} | null;

type IntentStore = {
  pendingIntent: PendingIntent;
  setIntent: (intent: PendingIntent) => void;
  clearIntent: () => void;
};

export const useIntentStore = create<IntentStore>((set) => ({
  pendingIntent: null,
  setIntent: (intent) => set({ pendingIntent: intent }),
  clearIntent: () => set({ pendingIntent: null }),
}));
