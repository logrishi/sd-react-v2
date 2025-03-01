import { create } from "zustand";
import { navigateTo } from "utils/navigation/navigate";
import { store } from "store/states";
import { useAuthStore } from "../store/states";

interface AuthState {
  isAuthenticated: boolean;
  user: null | { id: string; email: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ isAuthenticated: true, user: { id: "1", email } });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));

// Auth guard utility
export function authGuard() {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  if (!isAuthenticated) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
