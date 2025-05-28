// store/logStore.ts
'use client';

import { create } from 'zustand';

/* 1 ─ log row type */
export interface LogEntry {
  t: number;
  kind: "action" | "outcome" | "info";
  id?: string;
  description?: string;
  details?: any;
}

/* 2 ─ zustand slice (no persist) */
interface LogStore {
  entries: LogEntry[];
  push:  (e: LogEntry) => void;
  clear: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  entries: [],

  push: (entry) => set((state) => ({ entries: [...state.entries, entry] })),

  clear: () => set({ entries: [] }),
}));
