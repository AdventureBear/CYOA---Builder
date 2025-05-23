
import * as dagre from 'dagre'
import { Node, Edge, Position } from 'reactflow'

const nodeWidth = 200
const nodeHeight = 80

export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR' // TB = top-bottom, LR = left-right
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction })

  nodes.forEach(node => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const laidOutNodes = nodes.map(node => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
    }
  })

  return { nodes: laidOutNodes, edges }
}
