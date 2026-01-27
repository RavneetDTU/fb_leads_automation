// This is a placeholder for your global state management.
// You can use Context API, Zustand, Redux, etc.

import { create } from 'zustand';

export const useAppStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
