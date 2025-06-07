// components/SceneNode.tsx
import { NodeProps, Handle, Position } from 'reactflow';
import React from 'react';
import { useParams } from 'next/navigation';

export default function SceneNode({ id, data, selected }: NodeProps<{
  label: string;
  onEdit: (id: string) => void;
}>) {
  const params = useParams();
  const gameId = params?.game as string;

  return (
    <div
      className={`bg-white border p-2 relative min-h-[40px] w-40 rounded-md ${selected ? 'border-blue-500 shadow-lg' : 'border-slate-300'}`}
      style={{ userSelect: 'none' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
      <div className="text-sm font-bold truncate pr-6">{data.label}</div>
      
      <button
        onClick={() => data.onEdit(id)}
        className="text-xs text-blue-600 hover:underline mt-1"
      >
        Edit
      </button>
    </div>
  );
}