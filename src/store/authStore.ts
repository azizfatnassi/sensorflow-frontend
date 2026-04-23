import { create } from "zustand";

// On définit la forme du store (comme une interface Java)
interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  // Valeur initiale : on relit le token depuis localStorage
  // (pour survivre au rafraîchissement de la page)
  token: localStorage.getItem("token"),

  // Sauvegarde le token dans Zustand ET dans localStorage
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  // Supprime le token des deux endroits
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));