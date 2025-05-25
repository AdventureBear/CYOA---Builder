import {  GameState } from '@/app/types'


export function createInitialGameState(options: GameState): GameState {
  return {
    currentSceneId: options.currentSceneId,
    inventory: options.inventory || {},
    npcs: options.npcs || {},
    completedScenes: [],
    flags: {},
    reputation: {},
    health: options.health ?? 10,
    timeOfDay: 'morning',
    breadcrumbs: [],
  };
}

export const initialGameState: GameState = createInitialGameState({
  currentSceneId: 'start',
  completedScenes: [],
  inventory: {},
  flags: {},
  reputation: {},
  health: 10,
  npcs: {},
  timeOfDay: 'morning',
  breadcrumbs: [],
})