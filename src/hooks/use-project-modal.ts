import { Project } from "@/generated/prisma/client";
import { create } from "zustand";

type ProjectModalStore = {
  isOpen: boolean;
  project: Project | null;
  mode: "create" | "edit";
  onOpen: (project?: Project) => void;
  onClose: () => void;
};

export const useProjectModal = create<ProjectModalStore>((set) => ({
  isOpen: false,
  project: null,
  mode: "create",
  onOpen: (project) =>
    set({
      isOpen: true,
      project: project || null,
      mode: project ? "edit" : "create",
    }),
  onClose: () => set({ isOpen: false, project: null, mode: "create" }),
}));
