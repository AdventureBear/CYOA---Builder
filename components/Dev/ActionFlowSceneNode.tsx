import React from 'react';
import { Handle, Position } from 'reactflow';

interface ActionFlowSceneNodeProps {
    data: {
        label: string;
        onEdit?: () => void;
    };
    id: string;
}

export default function ActionFlowSceneNode({ data }: ActionFlowSceneNodeProps) {
    const { label, onEdit } = data;
    
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-blue-50 border border-blue-200">
            <Handle 
                type="target" 
                position={Position.Left}
                id="target"
                style={{ background: '#93c5fd' }}
            />
            <Handle 
                type="source" 
                position={Position.Right}
                id="source"
                style={{ background: '#93c5fd' }}
            />
            
            <div className="flex items-center">
                <div className="flex-1">
                    <div className="text-lg font-semibold text-blue-900">{label}</div>
                </div>
                {onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
} 