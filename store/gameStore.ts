import { GameState, Scene, Action } from '@/app/types';
import { initialGameState } from '@/lib/gameState';
import { updateBreadcrumbs } from '@/lib/updateBreadcrumbs';
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

// Define the store type
interface GameStore {
  gameState: GameState;
  setGameState: (newState: GameState) => void;
  updateGameState: (patch: Partial<GameState>) => void;
  // saveGame: () => string;
  // loadGame: (saveKey: string) => void;
  resetGame: () => void;
  actions: Record<string, Action> | null;
  scenes: Record<string, Scene> | null;
  setActions: (actions: Record<string, Action>) => void;
  setScenes: (scenes: Record<string, Scene>) => void;
  setTimeOfDay: (time: 'morning' | 'afternoon' | 'dusk' | 'night') => void;
  advanceTime: () => void;
  updateBreadcrumbs: (newSceneId: string) => void;
  lastChoice?: string;
  setLastChoice: (choiceText: string) => void;
  choiceStack: string[];
  pushChoice: (choiceText: string) => void;
  popChoice: () => void;
  resetChoiceStack: () => void;
}


const storeImpl: StateCreator<GameStore, [], [], GameStore> = (set, get) => ({
  gameState: initialGameState,
  setGameState: (newState: GameState) => set({ gameState: newState }),
  updateGameState: (patch: Partial<GameState>) =>
    set((state: GameStore) => ({
      gameState: { ...state.gameState, ...patch } as GameState,
    })),
  resetGame: () => set({ gameState: initialGameState }),
  actions: null,
  scenes: null,
  setActions: (actions) => {
    // console.log('setActions called', actions);
    set({ actions });
  },
  setScenes: (scenes) => set({ scenes }),
  setTimeOfDay: (time) => set((state) => ({ gameState: { ...state.gameState, timeOfDay: time } })),
  advanceTime: () => set((state) => {
    const order: Array<'morning' | 'afternoon' | 'dusk' | 'night'> = ['morning', 'afternoon', 'dusk', 'night'];
    const idx = order.indexOf(state.gameState.timeOfDay);
    const next: 'morning' | 'afternoon' | 'dusk' | 'night' = order[(idx + 1) % order.length];
    return { gameState: { ...state.gameState, timeOfDay: next } };
  }),
  updateBreadcrumbs: (newSceneId: string)  => {
    const {gameState, scenes} = get();
    if (!scenes) return;
    const newBreadcrumbs = updateBreadcrumbs(gameState.breadcrumbs, newSceneId, scenes);
    set ({gameState: {
      ...gameState,
      breadcrumbs: newBreadcrumbs,
    }})
  },
  lastChoice: undefined,
  setLastChoice: (choiceText) => set({ lastChoice: choiceText }),
  choiceStack: [],
  pushChoice: (choiceText) => set((state) => ({ choiceStack: [...state.choiceStack, choiceText] })),
  popChoice: () => set((state) => ({ choiceStack: state.choiceStack.slice(0, -1) })),
  resetChoiceStack: () => set({ choiceStack: [] }),
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

export const useGameStore = createGameStore(false);

