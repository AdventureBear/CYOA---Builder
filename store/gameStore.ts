import { GameState, Scene, Action } from '@/app/types';
import { initialGameState } from '@/lib/gameState';
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

// Define the store type
interface GameStore {
  gameState: GameState;
  setGameState: (newState: GameState) => void;
  updateGameState: (patch: Partial<GameState>) => void;
  // saveGame: () => string;
  loadGame: (saveKey: string) => void;
  resetGame: () => void;
  actions: Record<string, Action> | null;
  scenes: Record<string, Scene> | null;
  setActions: (actions: Record<string, Action>) => void;
  setScenes: (scenes: Record<string, Scene>) => void;
}

// Fun random save key generator
// function generateSaveKey(): string {
//   const adjectives = ['Mighty', 'Brave', 'Wise', 'Swift', 'Bold', 'Fierce', 'Noble', 'Valiant'];
//   const nouns = ['Hero', 'Adventurer', 'Saga', 'Quest', 'Journey', 'Voyage', 'Tale', 'Legend'];
//   const randomNum = Math.floor(Math.random() * 1000);
//   const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
//   const noun = nouns[Math.floor(Math.random() * nouns.length)];
//   return `${adj}${noun}${randomNum}`;
// }

const storeImpl: StateCreator<GameStore, [], [], GameStore> = (set) => ({
  gameState: initialGameState,
  setGameState: (newState: GameState) => set({ gameState: newState }),
  updateGameState: (patch: Partial<GameState>) =>
    set((state: GameStore) => ({
      gameState: { ...state.gameState, ...patch } as GameState,
    })),
  // saveGame: () => {
  //   // Only works in browser
  //   if (typeof window === 'undefined') return '';
  //   const saveKey = generateSaveKey();
  //   const saveData = {
  //     gameState: get().gameState,
  //     timestamp: new Date().toISOString(),
  //   };
  //   localStorage.setItem(`cyoa-save-${saveKey}`, JSON.stringify(saveData));
  //   return saveKey;
  // },
  loadGame: (saveKey: string) => {
    if (typeof window === 'undefined') return;
    const saveData = localStorage.getItem(`cyoa-save-${saveKey}`);
    if (saveData) {
      const { gameState } = JSON.parse(saveData);
      set({ gameState });
    }
  },
  resetGame: () => set({ gameState: initialGameState }),
  actions: null,
  scenes: null,
  setActions: (actions) => {
    console.log('setActions called', actions);
    set({ actions });
  },
  setScenes: (scenes) => set({ scenes }),
});

const isServer = typeof window === 'undefined';

export const createGameStore = (persisted = true) =>
  persisted
    ? create(
        persist(storeImpl, {
          name: 'cyoa-save',
          storage: isServer
            ? createJSONStorage(() => ({
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
              }))
            : createJSONStorage(() => localStorage),
          partialize: (state: GameStore) => ({ gameState: state.gameState }),
        } as PersistOptions<GameStore>)
      )
    : create(storeImpl);

export const useGameStore = createGameStore(true);

