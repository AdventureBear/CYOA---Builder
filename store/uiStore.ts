import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';
import type { Scene, Action } from '@/app/types';

export interface ContextualControl {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  keepOpen?: boolean;
}

export interface AccordionState {
    [key: string]: boolean;
}

interface UiState {
  contextualControls: ContextualControl[];
  setContextualControls: (controls: ContextualControl[]) => void;
  clearContextualControls: () => void;
  editingScene: Scene | null;
  deletingScene: Scene | null;
  editingAction: Action | null;
  deletingAction: Action | null;
  setEditingScene: (scene: Scene | null) => void;
  setDeletingScene: (scene: Scene | null) => void;
  setEditingAction: (action: Action | null) => void;
  setDeletingAction: (action: Action | null) => void;
  sceneManagerAccordion: AccordionState;
  actionManagerAccordion: AccordionState;
  toggleSceneManagerAccordion: (section: string) => void;
  toggleActionManagerAccordion: (section: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  contextualControls: [],
  setContextualControls: (controls) => set({ contextualControls: controls }),
  clearContextualControls: () => set({ contextualControls: [] }),
  editingScene: null,
  deletingScene: null,
  editingAction: null,
  deletingAction: null,
  setEditingScene: (scene) => set({ editingScene: scene }),
  setDeletingScene: (scene) => set({ deletingScene: scene }),
  setEditingAction: (action) => set({ editingAction: action }),
  setDeletingAction: (action) => set({ deletingAction: action }),
  sceneManagerAccordion: {
    all: false,
    disconnected: false,
    missing: false,
    orphaned: false,
  },
  actionManagerAccordion: {
    all: false,
    unused: false,
  },
  toggleSceneManagerAccordion: (section) =>
    set((state) => ({
      sceneManagerAccordion: {
        ...state.sceneManagerAccordion,
        [section]: !state.sceneManagerAccordion[section],
      },
    })),
  toggleActionManagerAccordion: (section) =>
    set((state) => ({
      actionManagerAccordion: {
        ...state.actionManagerAccordion,
        [section]: !state.actionManagerAccordion[section],
      },
    })),
})); 