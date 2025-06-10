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

interface HighlightHandlers {
    onHighlightSceneGroup: (sceneIds: string[]) => void;
    onResetHighlight: () => void;
}

const defaultHighlightHandlers: HighlightHandlers = {
    onHighlightSceneGroup: () => {},
    onResetHighlight: () => {},
};

export interface ActionVisualizationState {
    enabled: boolean;
    focusedScene: string | null;
    showConditions: boolean;
    showOutcomes: boolean;
}

const defaultActionVisualization: ActionVisualizationState = {
    enabled: false,
    focusedScene: null,
    showConditions: true,
    showOutcomes: true,
};

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
  highlightHandlers: HighlightHandlers;
  setHighlightHandlers: (handlers: HighlightHandlers) => void;
  actionVisualization: ActionVisualizationState;
  toggleActionVisualization: () => void;
  setFocusedScene: (sceneId: string | null) => void;
  toggleConditions: () => void;
  toggleOutcomes: () => void;
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
  highlightHandlers: defaultHighlightHandlers,
  setHighlightHandlers: (handlers) => set({ highlightHandlers: handlers }),
  actionVisualization: defaultActionVisualization,
  toggleActionVisualization: () => 
    set((state) => ({ 
      actionVisualization: {
        ...state.actionVisualization,
        enabled: !state.actionVisualization.enabled,
        // Reset focus when disabling
        focusedScene: !state.actionVisualization.enabled ? null : state.actionVisualization.focusedScene,
      }
    })),
  setFocusedScene: (sceneId) => 
    set((state) => ({ 
      actionVisualization: {
        ...state.actionVisualization,
        focusedScene: sceneId,
      }
    })),
  toggleConditions: () =>
    set((state) => ({
      actionVisualization: {
        ...state.actionVisualization,
        showConditions: !state.actionVisualization.showConditions,
      }
    })),
  toggleOutcomes: () =>
    set((state) => ({
      actionVisualization: {
        ...state.actionVisualization,
        showOutcomes: !state.actionVisualization.showOutcomes,
      }
    })),
})); 