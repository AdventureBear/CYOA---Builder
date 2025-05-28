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
    timeOfDay: 'dusk',
    season: 'spring',
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
  timeOfDay: 'dusk',
  season: 'spring',
  breadcrumbs: [],
})