import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastOptions = {
  description?: string;
  duration?: number;
  action?: {
    fn: () => void;
    text: string;
    variant?:
      | "outline"
      | "link"
      | "default"
      | "destructive"
      | "secondary"
      | "ghost"
      | null
      | undefined;
  };
};

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  options?: ToastOptions;
};

type ToastStoreState = {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
};

export const useToastStore = create<ToastStoreState>()((set) => ({
  toasts: [],
  addToast: (type = "info", message, options) =>
    set((state) => ({
      toasts: [
        {
          id: `${Date.now()}-${Math.random()}`,
          type,
          message,
          options,
        },
        ...state.toasts,
      ].slice(0, 3),
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearAllToasts: () => set({ toasts: [] }),
}));

export function useToast() {
  return useToastStore((state) => state.addToast);
}
