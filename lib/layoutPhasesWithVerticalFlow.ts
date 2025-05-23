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

export function sceneLayout(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const spacingY = 180         // vertical spacing between cards
  const spacingX = 380         // horizontal spacing between vertical stacks
  const columnHeight = 3       // number of cards in each vertical column
  const paddingBelowPhase = 100

  const phaseToNodes: Record<StoryPhase, Node[]> = {
    [StoryPhase.PEACEFUL_BEGINNINGS]: [],
    [StoryPhase.FIRST_VENTURES]: [],
    [StoryPhase.EXPANSION]: [],
    [StoryPhase.CONFLICT]: [],
    [StoryPhase.SETTLEMENT]: [],
    [StoryPhase.LEGACY]: []
  }

  // Group nodes by phase
  nodes.forEach(node => {
    const phase = node.data.storyPhase as StoryPhase
    if (phaseToNodes[phase]) {
      phaseToNodes[phase].push(node)
    }
  })

  let currentY = 0
  const positionedNodes: Node[] = []

  for (const phase of phaseOrder) {
    const phaseNodes = phaseToNodes[phase]
    const totalNodes = phaseNodes.length
    const columnsNeeded = Math.ceil(totalNodes / columnHeight)

    // Layout nodes in vertical columns for this phase
    phaseNodes.forEach((node, index) => {
      const col = Math.floor(index / columnHeight)
      const row = index % columnHeight

      const x = col * spacingX
      const y = currentY + row * spacingY

      positionedNodes.push({
        ...node,
        position: { x, y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
    })

    const rowsUsed = Math.min(columnHeight, totalNodes)
    const rowHeight = rowsUsed * spacingY
    currentY += rowHeight + paddingBelowPhase
  }

  return { nodes: positionedNodes, edges }
}
