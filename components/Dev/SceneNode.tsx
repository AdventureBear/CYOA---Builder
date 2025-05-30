// components/SceneNode.tsx
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function SceneNode({ data }: NodeProps) {
  return (
    <div className="p-2 border rounded bg-white shadow text-sm max-w-[180px]">
      <div className="font-semibold mb-1">{data.label}</div>
   
      <button
        className="text-xs text-blue-600 underline"
        onClick={data.onEdit}
      >
        Edit
      </button>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}