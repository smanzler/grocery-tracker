import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { useHouseholdStore } from "./household-store";

type AuthStoreState = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStoreState>((set, get) => {
  const updateAuthState = (session: Session | null) => {
    const isAuthenticated = !!session?.user && !session?.user.is_anonymous;
    set({
      session,
      user: session?.user || null,
      isAuthenticated,
      loading: false,
    });
  };

  return {
    session: null,
    user: null,
    isAuthenticated: false,
    initializing: true,
    loading: false,
    async initialize() {
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_, session) => {
        if (!get().initializing) {
          updateAuthState(session);
        }
      });

      // Get initial session
      const { data } = await supabase.auth.getSession();
      updateAuthState(data.session);
      set({ initializing: false });
    },

    async signIn(email: string, password: string) {
      set({ loading: true });
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error: error ? new Error(error.message) : null };
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error("Sign in failed"),
        };
      } finally {
        set({ loading: false });
      }
    },

    async signUp(displayName: string, email: string, password: string) {
      set({ loading: true });
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });
        return { error: error ? new Error(error.message) : null };
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error("Sign up failed"),
        };
      } finally {
        set({ loading: false });
      }
    },

    async signOut() {
      set({ loading: true });
      try {
        await supabase.auth.signOut();

        useHouseholdStore.getState().selectHousehold(null);

        set({
          session: null,
          user: null,
          isAuthenticated: false,
        });
      } finally {
        set({ loading: false });
      }
    },
  };
});
