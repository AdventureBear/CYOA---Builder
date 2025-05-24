'use client'
import React, { useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  Node,
  Edge,
  NodeChange
} from 'reactflow'
import 'reactflow/dist/style.css'

import { allScenes as scenes } from '@/data/scenes'

// import SceneCardNode from './sceneCardNode'
import { Scene, StoryPhase } from '@/app/types'
import { layoutByPhase } from '@/lib/layoutByPhase'
import { sceneLayout } from '@/lib/layoutPhasesWithVerticalFlow'

import { sceneNodeTypes } from '@/lib/sceneNodeTypes'



const phaseOrder: StoryPhase[] = [
    StoryPhase.PEACEFUL_BEGINNINGS,
    StoryPhase.FIRST_VENTURES,
    StoryPhase.EXPANSION,
    StoryPhase.CONFLICT,
    StoryPhase.SETTLEMENT,
    StoryPhase.LEGACY
  ]
  
  const handleSaveToFile = async (scene: Scene) => {
    const res = await fetch('/api/save-scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scene)
    })
  
    if (res.ok) {
      alert('Scene saved to file!')
    } else {
      alert('Error saving scene.')
    }
  }
  
const SceneFlow = () => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedScene, setSelectedScene] = useState<Node | null>(null)

  console.log('sceneNodeTypes', sceneNodeTypes)
// const nodeTypes = {
//   sceneCard: SceneCardNode
// }
//   const memoizedNodeTypes = useMemo(() => nodeTypes, [])

// const memoizedNodeTypes = useMemo(
//     () => ({
//       sceneCard: SceneCardNode
//     }),
//     []
//   )
  useEffect(() => {
    const initialNodes: Node[] = Object.values(scenes).map(scene => ({
      id: scene.id,
      type: 'sceneCard',
      position: { x: 0, y: 0 },
      data: {
        label: scene.name || scene.id,
        description: scene.text.slice(0, 100) + '...',
        storyPhase: scene.storyPhase
      }
    }))

    const initialEdges: Edge[] = []
    Object.values(scenes).forEach(scene => {
      scene.choices?.forEach(choice => {
        if (choice.nextScene) {
          initialEdges.push({
            // id: `${scene.id}-${choice.nextScene}`,
            id: `${scene.id}-${choice.text}-${choice.nextScene}`, // ✅ now unique
            source: scene.id,
            target: choice.nextScene,
            label: choice.text,
            type: 'default'
          })
        }
      })
    })
    const { nodes: laidOut, edges: connected } = sceneLayout(initialNodes, initialEdges)
    
    // const { nodes: laidOut, edges: connected } = layoutByPhase(initialNodes, initialEdges)

    setNodes(laidOut)
    setEdges(connected)
  }, [])

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds))
  }
  const onNodeClick = (_event: any, node: Node) => {
    console.log('node', node)
    setSelectedScene(node)
  }
  const filteredEdges = edges.map(edge => ({
    ...edge,
    label: selectedNodeId === edge.source ? edge.label : undefined
  }))



  return (
    <div style={{ width: '100%', height: '95vh' }}>



      <ReactFlow
        nodes={nodes}
        edges={filteredEdges}
        nodeTypes={sceneNodeTypes}
        onNodeClick={onNodeClick}
        // onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onNodesChange={onNodesChange}
        fitView
        panOnScroll
        zoomOnScroll
        zoomOnPinch
      >
        <Background color="#f0f0f0" />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedScene && (
  <div className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-lg z-50 p-4 overflow-y-auto border-l">
    <h2 className="text-lg font-semibold mb-2">Edit Scene</h2>

    <label className="block text-sm font-medium">Scene ID</label>
    <input
      className="w-full border px-2 py-1 mb-2"
      value={selectedScene.id}
      readOnly
    />

    <label className="block text-sm font-medium">Name</label>
    <input
      className="w-full border px-2 py-1 mb-2"
      value={selectedScene.data.label}
      onChange={(e) => {
        // Update in-memory data
        setSelectedScene({
          ...selectedScene,
          data: { ...selectedScene.data, label: e.target.value }
        })
      }}
    />

    <label className="block text-sm font-medium">Text</label>
    <textarea
      className="w-full border px-2 py-1 mb-2"
      rows={6}
      value={selectedScene.data.description}
      onChange={(e) =>
        setSelectedScene({
          ...selectedScene,
          data: { ...selectedScene.data, description: e.target.value }
        })
      }
    />

    <label className="block text-sm font-medium">Phase</label>
    <select
      className="w-full border px-2 py-1 mb-4"
      value={selectedScene.data.storyPhase}
      onChange={(e) =>
        setSelectedScene({
          ...selectedScene,
          data: { ...selectedScene.data, storyPhase: e.target.value }
        })
      }
    >
      {Object.values(StoryPhase).map((phase) => (
        <option key={phase} value={phase}>
          {phase.replace(/_/g, ' ')}
        </option>
      ))}
    </select>

    <button
      className="w-full bg-blue-600 text-white py-2 rounded"
      onClick={() => handleSaveToFile(selectedScene.data as Scene)}
    >
      💾 Save Scene to File
    </button>
  </div>
)}

    </div>
  )
}

export default SceneFlow
