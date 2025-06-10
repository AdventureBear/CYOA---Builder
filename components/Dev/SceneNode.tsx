// components/SceneNode.tsx
import { NodeProps, Handle, Position } from 'reactflow';
import React from 'react';
import { Sparkles } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
// import { useParams } from 'next/navigation';

interface SceneNodeData {
  label: string;
  onEdit: (id: string) => void;
  actions: string[];  // Array of action IDs in this scene, now required
}

export default function SceneNode({ id, data, selected }: NodeProps<SceneNodeData>) {
  const { actionVisualization, setFocusedScene } = useUiStore();
  const { onHighlightSceneGroup, onResetHighlight } = useUiStore(state => state.highlightHandlers);
  const hasActions = data.actions.length > 0;
  const isFocused = actionVisualization.focusedScene === id;

  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFocused) {
      setFocusedScene(null);
      onResetHighlight();
    } else {
      setFocusedScene(id);
      onHighlightSceneGroup([id]);
    }
  };

  return (
    <div
      className={`
        bg-white border p-2 relative min-h-[40px] w-40 rounded-md 
        ${selected ? 'border-blue-500 shadow-lg' : 'border-slate-300'}
        ${isFocused ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
      `}
      style={{ userSelect: 'none' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
      
      <div className="text-sm font-bold truncate pr-6">{data.label}</div>
      
      {/* Action Indicator */}
      {hasActions && actionVisualization.enabled && (
        <div 
          onClick={handleIndicatorClick}
          className={`
            absolute -right-1 -top-1 
            flex items-center justify-center
            w-5 h-5 rounded-full 
            ${isFocused ? 'bg-amber-400' : 'bg-amber-100 border-2 border-amber-400'}
            transition-colors
            cursor-pointer hover:scale-110
          `}
          title={`${data.actions.length} action${data.actions.length === 1 ? '' : 's'}`}
        >
          <Sparkles className={`w-3 h-3 ${isFocused ? 'text-amber-900' : 'text-amber-600'}`} />
        </div>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onEdit(id);
        }}
        className="text-xs text-blue-600 hover:underline mt-1"
      >
        Edit
      </button>
    </div>
  );
}