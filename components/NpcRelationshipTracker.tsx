'use client'

import React from 'react'
import { Progress } from "@/components/ui/progress"

interface NPCRelationshipTrackerProps {
  relationships: Record<string, { name: string, relationship: number }>
}

export function NpcRelationshipTracker({ relationships }: NPCRelationshipTrackerProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">NPC Relationships:</h3>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(relationships).map(([npcId, npc]) => (
          <div key={npcId}>
            <p className="font-semibold">{npc.name}</p>
            <Progress value={(npc.relationship + 100) / 2} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export class NPCRelationshipTracker {
}