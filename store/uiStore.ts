import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';

export interface ContextualControl {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface UiStoreState {
  contextualControls: ContextualControl[];
  setContextualControls: (controls: ContextualControl[]) => void;
  clearContextualControls: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  contextualControls: [],
  setContextualControls: (controls) => set({ contextualControls: controls }),
  clearContextualControls: () => set({ contextualControls: [] }),
})); 