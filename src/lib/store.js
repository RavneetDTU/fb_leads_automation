import { create } from "zustand";

/**
 * Modal store for Landing Page modals (Early Access & Book Setup).
 */
export const useModalStore = create((set) => ({
    isEarlyAccessOpen: false,
    isBookSetupOpen: false,

    openEarlyAccess: () => set({ isEarlyAccessOpen: true }),
    closeEarlyAccess: () => set({ isEarlyAccessOpen: false }),

    openBookSetup: () => set({ isBookSetupOpen: true }),
    closeBookSetup: () => set({ isBookSetupOpen: false }),
}));
