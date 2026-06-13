import { create } from "zustand";

type SettingsStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isWidthIncreased: boolean;
  toggleWidth: () => void;
};

export const useSettings = create<SettingsStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  isWidthIncreased: false,
  toggleWidth: () => set((state) => ({ isWidthIncreased: !state.isWidthIncreased })),
}));
