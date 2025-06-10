import { NodeProps, Handle, Position } from 'reactflow';
import React from 'react';
import { Rabbit, Zap } from 'lucide-react';
import { Action, Condition } from '@/app/types';

interface ActionNodeData {
    action: Action;
    onEdit?: (actionId: string) => void;
}

const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
        case 'onEnter':
            return Zap;
        case 'onChoice':
            return Rabbit;
        default:
            return Zap;
    }
};

const getConditionSummary = (conditions: Condition[] | undefined) => {
    if (!conditions || conditions.length === 0) return 'No conditions';
    return conditions.map(c => {
        switch (c.type) {
            case 'flagSet':
                return `Has ${c.key}`;
            case 'flagNotSet':
                return `No ${c.key}`;
            case 'hasItem':
                return `Has ${c.key}`;
            case 'doesNotHaveItem':
                return `No ${c.key}`;
            default:
                return c.type;
        }
    }).join(', ');
};

export default function ActionNode({  data, selected }: NodeProps<ActionNodeData>) {
    const { action, onEdit } = data;
    const TriggerIcon = getTriggerIcon(action.trigger);
    const conditions = action.conditions;
    const hasConditions = conditions && conditions.length > 0;

    return (
        <div
            className={`relative ${selected ? 'z-50' : 'z-10'}`}
            style={{ width: '180px' }}
        >
            <div 
                className={`
                    relative p-2 
                    ${selected ? 'bg-amber-50 shadow-lg border-amber-400' : 'bg-amber-50/70 border-amber-300'} 
                    border-2 rounded-lg
                    transition-colors
                `}
            >
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
                    style={{ background: '#f59e0b' }}
                />

                {/* Action Header */}
                <div className="flex items-center gap-1 mb-1">
                    <TriggerIcon className="w-4 h-4 text-amber-700" />
                    <div className="text-sm font-semibold text-amber-900 truncate">
                        {action.id}
                    </div>
                </div>

                {/* Conditions Summary */}
                <div className="text-xs text-amber-700">
                    {getConditionSummary(conditions)}
                </div>

                {/* Edit Button */}
                {onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(action.id);
                        }}
                        className="absolute top-1 right-1 text-xs text-amber-600 hover:text-amber-800"
                    >
                        Edit
                    </button>
                )}

                {/* Condition Indicator */}
                {hasConditions && (
                    <div 
                        className="absolute -left-1 -top-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"
                        title={`${conditions.length} condition${conditions.length === 1 ? '' : 's'}`}
                    />
                )}
            </div>
        </div>
    );
} 