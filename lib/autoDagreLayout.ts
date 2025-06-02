import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

export function dagreLayout(nodes: Node[], edges: Edge[]) {
  if (!nodes.length) return { nodes, edges };
  const g = new dagre.graphlib.Graph().setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 });
  const nodeIds = new Set(nodes.map(n => n.id));
  if (nodeIds.size !== nodes.length) {
    throw new Error('Duplicate node id detected');
  }
  nodes.forEach(n => {
    if (!n.id) throw new Error('Node missing id');
    g.setNode(n.id, { width: 160, height: 60 });
  });

  // Split edges
  const validEdges: Edge[] = [];
  const orphanedEdges: Edge[] = [];
  edges.forEach(e => {
    const hasSource = nodeIds.has(e.source as string);
    const hasTarget = nodeIds.has(e.target as string);
    if (!e.source || !e.target) return; // skip truly broken
    if (hasSource && hasTarget && e.source !== e.target) {
      validEdges.push(e);
    } else {
      orphanedEdges.push(e);
    }
  });

  // Add valid edges to dagre
  const edgeSet = new Set<string>();
  validEdges.forEach(e => {
    const edgeKey = `${e.source}|${e.target}`;
    if (!edgeSet.has(edgeKey)) {
      g.setEdge(e.source, e.target);
      edgeSet.add(edgeKey);
    }
  });

  dagre.layout(g);

  // Layout valid nodes
  const laidOutNodes = nodes.map(n => {
    const pos = g.node(n.id);
    if (!pos) return n;
    return { ...n, position: { x: pos.x, y: pos.y } };
  });

  // Add ghost nodes for missing targets/sources
  const ghostNodes: Node[] = [];
  const ghostNodeIds = new Set<string>();
  orphanedEdges.forEach(e => {
    if (!nodeIds.has(e.source as string) && !ghostNodeIds.has(e.source as string)) {
      ghostNodes.push({
        id: e.source as string,
        data: { label: `Missing: ${e.source}` },
        position: { x: 0, y: 0 },
        style: { background: '#fff0f0', border: '2px dashed red', color: 'red' },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        type: 'input',
      });
      ghostNodeIds.add(e.source as string);
    }
    if (!nodeIds.has(e.target as string) && !ghostNodeIds.has(e.target as string)) {
      ghostNodes.push({
        id: e.target as string,
        data: { label: `Missing: ${e.target}` },
        position: { x: 0, y: 0 },
        style: { background: '#fff0f0', border: '2px dashed red', color: 'red' },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        type: 'output',
      });
      ghostNodeIds.add(e.target as string);
    }
  });

  // Place ghost nodes near their connected node (if possible)
  ghostNodes.forEach(gn => {
    // Find a valid node connected to this ghost node
    const connected = validEdges.find(e => e.source === gn.id || e.target === gn.id);
    if (connected) {
      const refId = nodeIds.has(connected.source) ? connected.source : connected.target;
      const refNode = laidOutNodes.find(n => n.id === refId);
      if (refNode) {
        gn.position = { x: refNode.position.x + 200, y: refNode.position.y + 80 };
      }
    }
  });

  // Return all nodes and edges for React Flow
  return {
    nodes: [...laidOutNodes, ...ghostNodes],
    edges: [...validEdges, ...orphanedEdges],
  };
}