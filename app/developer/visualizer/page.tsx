'use client';

import React, { useEffect, useMemo } from 'react';
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
    scenes: Record<string, Scene>
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
        data: { label: scene.id },
        position: { x: (idx % 4) * 120, y: Math.floor(idx / 4) * 120 },
        style: { width: 160, padding: 8, fontSize: 12 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
  const scenes = useGameStore((s) => s.scenes);
 const [nodes, setNodes, onNodesChange] = useNodesState([]);



  /* build graph once whenever scenes changes */
  const { nodes: initialNodes, edges } = useMemo(
    () => buildGraph(scenes || {}),
    [scenes]
  );
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])
  
  /* make nodes drag-able */
  if (!scenes) return <p>Loading graph…</p>;

  const initialViewport = { x: 150, y: 150, zoom: 1.2 };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}  
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
  );
}
