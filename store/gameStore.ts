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
  loading: boolean;
  error: string | null;
  setActions: (actions: Record<string, Action>) => void;
  setScenes: (scenes: Record<string, Scene>) => void;
  updateScene: (scene: Scene) => void;
  setTimeOfDay: (time: 'morning' | 'afternoon' | 'dusk' | 'night') => void;
  advanceTime: () => void;
  updateBreadcrumbs: (newSceneId: string) => void;
  lastChoice?: string;
  setLastChoice: (choiceText: string) => void;
  choiceStack: string[];
  pushChoice: (choiceText: string) => void;
  popChoice: () => void;
  resetChoiceStack: () => void;
  removeScene: (sceneId: string) => void;
  fetchAndSetGameData: (gameId: string) => Promise<void>;
}


const storeImpl: StateCreator<GameStore, [], [], GameStore> = (set, get) => ({
  gameState: initialGameState,
  setGameState: (newState: GameState) => set({ gameState: newState }),
  updateGameState: (patch: Partial<GameState>) =>
    set((state: GameStore) => ({
      gameState: { ...state.gameState, ...patch } as GameState,
    })),
  resetGame: () => set({ gameState: initialGameState, scenes: null, actions: null }),
  actions: null,
  scenes: null,
  loading: true,
  error: null,
  setActions: (actions) => {
    // console.log('setActions called', actions);
    set({ actions });
  },
  setScenes: (scenes) => set({ scenes }),
  updateScene: (scene: Scene) =>
    set((state) => ({
      scenes: {
        ...state.scenes,
        [scene.id]: scene,
      },
    })),
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
  removeScene: (sceneId) => set((state) => {
    if (!state.scenes) return {};
    const newScenes = { ...state.scenes };
    delete newScenes[sceneId];
    return { scenes: newScenes };
  }),
  fetchAndSetGameData: async (gameId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/db/game/${gameId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch game data: ${response.statusText}`);
      }
      const data = await response.json();
      set({ actions: data.actions, scenes: data.scenes, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
      console.error('Error fetching and setting game data:', error);
    }
  },
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

