// components/SceneNode.tsx
import { NodeProps, Handle, Position } from 'reactflow';
import React, { useState, useEffect, useRef } from 'react';
import { SceneContextMenu } from './SceneManager/SceneSidebarDetailModal';
import { Play } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function SceneNode({ data, selected }: NodeProps<{ label: string; onEdit: () => void }>) {
  const params = useParams();
  const gameId = params?.game as string;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent node selection
    const sceneUrl = `/scene/${data.label}?game=${gameId}`;
    window.open(sceneUrl, '_blank');
  };

  return (
    <div
      className={`bg-white border p-2 relative min-h-[40px] w-40 rounded-md ${selected ? 'border-blue-500 shadow-lg' : 'border-slate-300'}`}
      style={{ userSelect: 'none', cursor: 'context-menu' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
      {/* Node label */}
      <div className="text-sm font-bold truncate">{data.label}</div>
      
      <button 
        onClick={handlePlay}
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-green-100 text-green-600 opacity-80 hover:opacity-100 transition-all"
        title="Play from this scene"
      >
        <Play size={16} />
      </button>

      <button
        onClick={data.onEdit}
        className="text-xs text-blue-600 hover:underline mt-1"
      >
        Edit
      </button>
    </div>
  );
}