// app/developer/flowtest.tsx
'use client';
import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const nodes = [
  { id: '1', data: { label: 'A' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: 'B' }, position: { x: 200, y: 100 } },
];
const edges = [
  { id: 'e1-2', source: '1', target: '2', label: 'to B' },
];

export default function FlowTest() {
    console.log(nodes, edges, "nodes and edges")
  return (
    <div className="flex-1 w-full flex flex-col min-h-0">
      <div className="flex-1 w-full min-h-0" style={{ border: '2px solid red', background: '#f0f0f0' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}