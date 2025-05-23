'use client';
import { create } from 'zustand';

export interface ModalChoice {
  text: string;
  nextAction?: string;        // optional follow‑up action id
}

export interface ModalData {
  id: string;                 // "gift_from_elder/outcome0"
  description: string;
  choices?: ModalChoice[];    // if undefined → simple "Dismiss"
}

interface ModalStore {
  queue: ModalData[];
  push: (m: ModalData) => void;
  pop: () => void;
  current: () => ModalData | undefined;
  setModal: (modal: ModalData | null) => void;
  modal: ModalData | null;
  clear: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
  queue: [],
  modal: null, // SSR-safe: always null initially
  push: (m) => {
    set((s) => {
      // Prevent pushing the same modal twice in a row
      if (s.modal && s.modal.id === m.id) {
        return s;
      }
      return { queue: [...s.queue, m], modal: m };
    });
  },
  pop: () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    set((s) => {
      const newQueue = s.queue.slice(1);
      return { queue: newQueue, modal: newQueue[0] || null };
    });
  },
  current: () => {
    if (typeof window === 'undefined') return undefined; // Return undefined during SSR
    const modal = get().modal;
    return modal === null ? undefined : modal;
  },
  setModal: (modal) => set({ modal }),
  clear: () => set({ queue: [], modal: null }),
}));
