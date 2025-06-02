'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  useNodesState,
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGameStore } from '@/store/gameStore';
import { Scene } from '@/app/types';
import DeveloperNav from '../../../components/Dev/DeveloperNav';
import SceneNode from '@/components/Dev/SceneNode';
import Modal from '@/components/ui/Modal';
import SceneForm from '@/components/Dev/SceneForm';
import { useLoadScenesAndActions } from '@/lib/useLoadScenesAndActions';
import { saveSceneAndUpdateStore } from '@/lib/sceneHandlers';




/* 0. Helper to map variant id -> hub id */
// function hubId(id: string) {
//     return id.replace(/_(spring|summer|fall|winter|morning|afternoon|evening)$/, '');
//   }

/* ------------------------------------------------------------------
   buildGraph — ONE arrow per real navigation direction
   • dashed parent → child, solid normal choices
   • "Return to …" links get no label
   -----------------------------------------------------------------*/

   
 function buildGraph(
    scenes: Record<string, Scene>,
    handleEdit: (sceneId: string) => void,
    handleNeighbors: (sceneId: string) => void,
    handleHighlightNeighbors: (sceneId: string) => void
  ): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const pairInfo = new Map<
      string,
      {
        fromParent?: string;   // label we want (choice in parent scene)
        fwd?: boolean;         // lexical A< B arrow
        rev?: boolean;         // reverse arrow
        parentDir?: "AtoB" | "BtoA";
      }
    >();
  
    const keyOf = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  
    /* ---------- scan scenes ------------------------------------------ */
    Object.values(scenes).forEach((scene, idx) => {
      /* node */
      nodes.push({
        id: scene.id,
        type: 'scene',
        // data: { label: scene.id },
        position: { x: (idx % 4) * 120, y: Math.floor(idx / 4) * 120 },
        style: { width: 160, padding: 8, fontSize: 12 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: scene.id,
          onEdit: () => handleEdit(scene.id),
          onNeighbors: () => handleNeighbors(scene.id),
          onHighlightNeighbors: () => handleHighlightNeighbors(scene.id),
        },
      });
  
      /* parent relationship */
      if (scene.parentSceneId) {
        const parentId = scene.parentSceneId;
        const key = keyOf(parentId, scene.id);
        const info = pairInfo.get(key) || {};
  
        // which direction is parent→child?
        info.parentDir = parentId < scene.id ? "AtoB" : "BtoA";
  
        // grab the choice text from the parent scene (if exists)
        const parent = scenes[parentId];
        const txt = parent?.choices?.find((c) => c.nextNodeId === scene.id)?.text;
        if (txt) info.fromParent = txt;
  
        // set direction flag
        if (parentId < scene.id) info.fwd = true; else info.rev = true;
  
        pairInfo.set(key, info);
      }
  
      /* normal choices */
      scene.choices?.forEach((ch) => {
        if (!ch.nextNodeId) return;
  
        // skip "Return to ..." choices (child back to parent)
        const isReturn = ch.nextNodeId === scene.parentSceneId;
        if (isReturn) return;
  
        const from = scene.id;
        const to = ch.nextNodeId;
        const key = keyOf(from, to);
        const info = pairInfo.get(key) || {};
  
        // label only if this scene is the parent in the pair
        if (from === scene.id) info.fromParent = ch.text;
  
        // direction flags
        if (from < to) info.fwd = true; else info.rev = true;
  
        pairInfo.set(key, info);
      });
    });
  
    /* ---------- build final edges ------------------------------------ */
    const edges: Edge[] = [];
  
    pairInfo.forEach((info, key) => {
      const [a, b] = key.split("|");
      const twoWay = info.fwd && info.rev;
      // const parentIsA = info.parentDir === "AtoB";
  
      edges.push({
        id: key,
        source: a,
        target: b,
        label: info.fromParent,                       // parent choice text
        style: info.parentDir
          ? { strokeDasharray: "4 4", stroke: "#888" }  // dashed parent link
          : { stroke: "#3399ff" },
        labelStyle: { fill: "#3399ff", fontSize: 9 },
  
        // arrow heads
        markerEnd:
          (twoWay || info.fwd) ? { type: MarkerType.ArrowClosed, width: 10, height: 10 } : undefined,
        markerStart:
          (twoWay || info.rev) ? { type: MarkerType.ArrowClosed, width: 10, height: 10 } : undefined,
      });
    });
  
    return { nodes, edges };
  }
  
  

/* ---------- component ---------------------------------------------- */
export default function SceneFlow() {
  useLoadScenesAndActions();
  const scenes = useGameStore((s) => s.scenes);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const [selectedScene, setSelectedScene] = React.useState<Scene | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const handleNeighbors = (sceneId: string) => setSelectedNodeId(sceneId);

  const handleEdit = React.useCallback((sceneId: string) => {
    if (!scenes) return;
    const scene = scenes[sceneId];
    if (scene) {
      setSelectedScene(scene);
      setModalOpen(true);
    }
  }, [scenes]);

  // New: highlight neighbors handler
  const handleHighlightNeighbors = (sceneId: string) => {
    setSelectedNodeId(sceneId);
    // setModalOpen(true);
  };

  const handleSave = async (updatedScene: Scene) => {
    const scenesObj = useGameStore.getState().scenes;
    const setScenes = useGameStore.getState().setScenes;
    const scenesArr = Object.values(scenesObj || {});
    const editIndex = scenesArr.findIndex(s => s.id === updatedScene.id);
    const game = 'cute-animals'; // Or get from search params if available
    try {
      await saveSceneAndUpdateStore({
        form: updatedScene,
        editIndex,
        scenes: scenesArr,
        scenesObj,
        setScenes,
        game,
      });
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save scene');
    }
  };

 // nodeTypes for React Flow
const nodeTypes = useMemo(() => ({ scene: SceneNode }), []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(scenes || {}, handleEdit, handleNeighbors, handleHighlightNeighbors),
    [scenes, handleEdit]
  );

  // Set nodes directly from initialNodes (no dagre layout)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Highlight logic
  const outgoing = new Set<string>();
  const incoming = new Set<string>();
  const twoWay = new Set<string>();
  if (selectedNodeId && scenes) {
    // Outgoing: selected node's choices
    const selectedScene = scenes[selectedNodeId];
    if (selectedScene && selectedScene.choices) {
      selectedScene.choices.forEach(ch => {
        if (ch.nextNodeId) outgoing.add(ch.nextNodeId);
      });
    }
    // Incoming: any scene whose choices point to selected node
    Object.values(scenes).forEach(scene => {
      if (scene.id === selectedNodeId) return;
      scene.choices?.forEach(ch => {
        if (ch.nextNodeId === selectedNodeId) incoming.add(scene.id);
        // Check for two-way
        if (ch.nextNodeId === selectedNodeId && selectedScene.choices?.some(c2 => c2.nextNodeId === scene.id)) {
          twoWay.add(scene.id);
        }
      });
    });
  }

  const nodesWithHighlight = initialNodes.map(node => {
    let style = node.style || {};
    if (node.id === selectedNodeId) {
      style = { ...style, border: '3px solid #3399ff', boxShadow: '0 0 10px #3399ff' };
    } else if (outgoing.has(node.id) || incoming.has(node.id)) {
      style = { ...style, border: '3px solid orange', boxShadow: '0 0 10px orange' };
    }
    return { ...node, style };
  });

  const edgesWithHighlight = initialEdges.map(edge => {
    let style = { ...edge.style };
    let isOutgoing = false, isIncoming = false, isTwoWay = false;
    if (selectedNodeId) {
      if (edge.source === selectedNodeId && outgoing.has(edge.target)) {
        isOutgoing = true;
        if (twoWay.has(edge.target)) isTwoWay = true;
      } else if (edge.target === selectedNodeId && incoming.has(edge.source)) {
        isIncoming = true;
        if (twoWay.has(edge.source)) isTwoWay = true;
      }
    }
    if (isTwoWay) {
      style = { ...style, strokeDasharray: '4 4', stroke: '#888', strokeWidth: 3 };
    } else if (isOutgoing) {
      style = { ...style, stroke: 'green', strokeWidth: 3 };
    } else if (isIncoming) {
      style = { ...style, stroke: 'red', strokeWidth: 3 };
    }
    return { ...edge, style };
  });

  console.log('Visualizer nodes:', nodesWithHighlight, 'edges:', edgesWithHighlight);

  if (!scenes) return <p>Loading graph…</p>;

  const initialViewport = { x: 0, y: 0, zoom: 1.2 };

  return (
    <div className="min-h-screen w-full h-full flex flex-col">
      <div className="w-full relative z-20 shadow bg-white py-3">
        <DeveloperNav />
      </div>
      <div className="mx-auto mt-8 rounded-xl shadow" style={{ width: '80vw', background: '#fff' }}>
        <div className="w-full h-[600px]">
          <ReactFlow
            nodes={nodes}
            edges={edgesWithHighlight}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            defaultViewport={initialViewport}
            panOnScroll
            zoomOnScroll
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} />
            <MiniMap pannable zoomable />
            <Controls position="top-right" />
          </ReactFlow>
        </div>
      </div>
      <Modal open={modalOpen}>
        {selectedScene && (
          <SceneForm 
            scene={selectedScene}
            onSave={handleSave}
            actionsObj={useGameStore.getState().actions}
            allScenes={Object.values(useGameStore.getState().scenes || {})}
            setActionsObj={useGameStore.getState().setActions}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
