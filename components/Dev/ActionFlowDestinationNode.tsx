import React from 'react';
import { Handle, Position } from 'reactflow';

interface ActionFlowDestinationNodeProps {
    data: {
        label: string;
        type: 'scene' | 'action';
    };
}

export default function ActionFlowDestinationNode({ data }: ActionFlowDestinationNodeProps) {
    const bgColor = data.type === 'scene' ? 'bg-emerald-50' : 'bg-amber-50';
    const borderColor = data.type === 'scene' ? 'border-emerald-200' : 'border-amber-200';
    const textColor = data.type === 'scene' ? 'text-emerald-700' : 'text-amber-700';

    return (
        <div className={`px-4 py-2 shadow-md rounded-md ${bgColor} border ${borderColor} min-w-[150px]`}>
            <Handle type="target" position={Position.Left} />
            
            <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${textColor}`}>
                    {data.type === 'scene' ? '→ Scene: ' : '→ Action: '}
                    {data.label}
                </div>
            </div>
        </div>
    );
} 