import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';
import type { Scene } from '@/app/types';

export interface ContextualControl {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface UiStoreState {
  contextualControls: ContextualControl[];
  setContextualControls: (controls: ContextualControl[]) => void;
  clearContextualControls: () => void;
  editingScene: Scene | null;
  setEditingScene: (scene: Scene | null) => void;
  deletingScene: Scene | null;
  setDeletingScene: (scene: Scene | null) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  contextualControls: [],
  setContextualControls: (controls) => set({ contextualControls: controls }),
  clearContextualControls: () => set({ contextualControls: [] }),
  editingScene: null,
  setEditingScene: (scene) => set({ editingScene: scene }),
  deletingScene: null,
  setDeletingScene: (scene) => set({ deletingScene: scene }),
})); 