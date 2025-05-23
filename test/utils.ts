import { createGameStore } from '../store/gameStore'
import { initialGameState } from '../lib/gameState'
import { applyChanges } from '@/engine/applyChanges'
import { allActions as actions } from '../data/actions'

export function setupTestStore(overrides = {}) {
  const store = createGameStore(false)
  store.getState().setGameState({
    ...initialGameState,
    ...overrides, // allow customizations per test
  })
  return store
}

export function runActionInTestStore(store: ReturnType<typeof setupTestStore>, actionKey: keyof typeof actions) {
    const action = actions[actionKey]
    if (!action) throw new Error(`Action '${actionKey}' not found`)
    let state = store.getState().gameState
    action.outcomes.forEach(outcome => {
      if (outcome.stateChanges) {
        state = applyChanges(state, outcome.stateChanges)
      }
    })
    store.getState().setGameState(state)
  }