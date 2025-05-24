import React from 'react'
import { Handle, NodeProps, Position } from 'reactflow'
import { StoryPhase } from '@/app/types'

const phaseColors: Record<StoryPhase, string> = {
  PEACEFUL_BEGINNINGS: '#fef3c7',
  FIRST_VENTURES: '#dbeafe',
  EXPANSION: '#d1fae5',
  CONFLICT: '#fcd34d',
  SETTLEMENT: '#fbcfe8',
  LEGACY: '#e0e7ff'
}

export default function SceneCardNode({ id, data, selected }: NodeProps) {
  const bgColor = phaseColors[data.storyPhase as StoryPhase] || '#f3f4f6'


  return (
    <div
      className="rounded-xl shadow-lg px-4 py-3 border border-gray-300 text-sm max-w-xs transition-all"
      style={{
        paddingBottom: '20px',
        backgroundColor: bgColor,
        opacity: selected ? 1 : 0.85,
        boxShadow: selected ? '0 0 10px 0 rgba(0, 0, 0, 0.92)' : 'none',
        pointerEvents: 'auto',
        cursor: 'grab'
      }}
    >
      <strong className="block text-md mb-1">{data.label}</strong>
      <p className="text-xs text-gray-700">{data.description}</p>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
