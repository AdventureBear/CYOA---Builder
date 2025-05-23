import { Node, Edge, Position } from 'reactflow'
import { StoryPhase } from '@/app/types'

const phaseOrder: StoryPhase[] = [
  StoryPhase.PEACEFUL_BEGINNINGS,
  StoryPhase.FIRST_VENTURES,
  StoryPhase.EXPANSION,
  StoryPhase.CONFLICT,
  StoryPhase.SETTLEMENT,
  StoryPhase.LEGACY
]

export function layoutByPhase(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const spacingX = 250
  const spacingY = 400

  const phaseGroups: Record<StoryPhase, Node[]> = {
    PEACEFUL_BEGINNINGS: [],
    FIRST_VENTURES: [],
    EXPANSION: [],
    CONFLICT: [],
    SETTLEMENT: [],
    LEGACY: []
  }

  // Group nodes by phase
  nodes.forEach(node => {
    const phase = node.data.storyPhase as StoryPhase
    phaseGroups[phase]?.push(node)
  })

  // Lay out each group as a row
  const laidOutNodes: Node[] = []
  phaseOrder.forEach((phase, rowIndex) => {
    const row = phaseGroups[phase]
    row.forEach((node, colIndex) => {
      laidOutNodes.push({
        ...node,
        position: {
          x: colIndex * spacingX,
          y: rowIndex * spacingY
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    })
  })

  return { nodes: laidOutNodes, edges }
}
