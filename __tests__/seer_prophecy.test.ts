import { describe, it, expect, beforeEach } from 'vitest'
import { createGameStore } from '../store/gameStore'
import { allActions as actions } from '../data/actions'
import { runActionInTestStore, setupTestStore } from '@/test/utils'

let useGameStore: ReturnType<typeof createGameStore>

describe('seer_prophecy scene', () => {
    let useGameStore: ReturnType<typeof setupTestStore>
    beforeEach(() => {
        useGameStore = setupTestStore()
    })

  it('seer_vision action increments omenToken in inventory', () => {
    const action = actions['seer_vision']
    expect(action, "Action 'seer_vision' should exist in allActions").toBeTruthy()
    runActionInTestStore(useGameStore, 'seer_vision')
   
    //Check inventory items after action
    const { inventory } = useGameStore.getState().gameState
    expect(inventory).toHaveProperty('Omen Token')
    expect(typeof inventory['Omen Token']).toBe('number')
    expect(inventory['Omen Token']).toBeGreaterThan(0)
  })

  it('seer_vision action sets visitedSeer flag', () => {
    runActionInTestStore(useGameStore, 'seer_vision')
    const { flags } = useGameStore.getState().gameState
    console.log('flags', flags)
    expect(flags).toHaveProperty('visitedSeer')
    expect(flags.visitedSeer).toBe(true)
  })

})
