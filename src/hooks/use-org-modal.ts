import { create } from "zustand";

type useOrgModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useOrgModal = create<useOrgModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
