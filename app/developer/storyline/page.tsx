"use client";
import React from "react";
import ReactFlow, { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { useGameStore } from "@/store/gameStore";
import { Scene } from "@/app/types";
import { useLoadScenesAndActions } from '@/lib/useLoadScenesAndActions';

function toGraph(scenes: Record<string, Scene> | null): { nodes: Node[]; edges: Edge[] } {
  if (!scenes) return { nodes: [], edges: [] };
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  Object.values(scenes).forEach((scene, idx) => {
    nodes.push({
      id: scene.id,
      data: { label: scene.name || scene.id },
      position: { x: 100 + idx * 200, y: 100 },
    });
    scene.choices?.forEach((choice) => {
      if (choice.nextScene) {
        edges.push({
          id: `${scene.id}->${choice.nextScene}`,
          source: scene.id,
          target: choice.nextScene,
          label: choice.text,
        });
      }
    });
  });
  return { nodes, edges };
}

export default function StorylinePage() {
  useLoadScenesAndActions();
  const scenes = useGameStore((state) => state.scenes);
  const { nodes, edges } = toGraph(scenes);

  return (
    <div style={{ width: "100vw", height: "80vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView />
    </div>
  );
} 