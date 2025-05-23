'use client'

import { Scene } from '@/app/types'
import { allScenes } from '@/data/scenes'

const dynamicallyGeneratedScenes: Record<string, Scene> = {}

export function addDynamicallyGeneratedScene(scene: Scene) {
  dynamicallyGeneratedScenes[scene.id] = {
    ...scene,
    isDynamicallyGenerated: true
  }
}

export function getAllScenes(): Record<string, Scene> {
  return { ...allScenes };
}