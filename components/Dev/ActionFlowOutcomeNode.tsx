import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Outcome, StateChange, Condition } from '@/app/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionFlowOutcomeNodeProps {
    data: {
        outcome: Outcome;
    };
}

function formatCondition(condition: Condition): string {
    switch (condition.type) {
        case 'hasItem':
            return `Has ${condition.key}${condition.value ? `: ${condition.value}` : ''}`;
        case 'doesNotHaveItem':
            return `Missing ${condition.key}`;
        case 'flagSet':
            return `Flag ${condition.key} is set${condition.value ? ` to ${condition.value}` : ''}`;
        case 'flagNotSet':
            return `Flag ${condition.key} not set`;
        case 'random':
            return `${(condition.chance || 0) * 100}% chance`;
        case 'reputation':
            return `${condition.key} rep ${condition.comparator || '='} ${condition.value}`;
        case 'seasonIs':
            return `Season is ${condition.value}`;
        case 'timeOfDayIs':
            return `Time is ${condition.value}`;
        default:
            return `${condition.type}: ${condition.key} ${condition.value}`;
    }
}

function formatStateChange(change: StateChange): string {
    switch (change.type) {
        case 'addItem':
            return `Add ${change.amount || 1} ${change.key}`;
        case 'removeItem':
            return `Remove ${change.amount || 1} ${change.key}`;
        case 'setFlag':
            return `Set ${change.key}${change.amount ? ` to ${change.amount}` : ''}`;
        default:
            return `${change.type} ${change.key}`;
    }
}

export default function ActionFlowOutcomeNode({ data }: ActionFlowOutcomeNodeProps) {
    const { outcome } = data;
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div 
            className={`px-4 py-2 shadow-md rounded-md bg-purple-50 border border-purple-200 w-[375px] transition-all duration-200 ${isExpanded ? 'max-h-none' : 'max-h-[200px]'}`}
            onClick={toggleExpand}
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
            
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-purple-700">
                        Outcome
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 hover:bg-purple-100"
                        onClick={toggleExpand}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {outcome.conditions && outcome.conditions.length > 0 && (
                    <div className={`text-xs text-purple-700 bg-purple-100 p-2 rounded ${!isExpanded && 'line-clamp-2'}`}>
                        <div className="font-medium mb-1">Requires:</div>
                        {outcome.conditions.map((condition, i) => (
                            <div key={i} className="truncate">
                                {formatCondition(condition)}
                            </div>
                        ))}
                    </div>
                )}
                
                {outcome.description && (
                    <div className={`text-sm text-purple-900 border-b border-purple-100 pb-1 ${!isExpanded && 'line-clamp-2'}`}>
                        {outcome.description}
                    </div>
                )}
                
                {outcome.stateChanges && outcome.stateChanges.length > 0 && (
                    <div className={`text-xs text-purple-700 ${!isExpanded && 'line-clamp-2'}`}>
                        <div className="font-medium mb-1">Changes:</div>
                        {outcome.stateChanges.map((change, i) => (
                            <div key={i} className="truncate">
                                {formatStateChange(change)}
                            </div>
                        ))}
                    </div>
                )}

                {outcome.nextSceneOverride && (
                    <div className="text-xs text-purple-700 truncate">
                        <span className="font-medium">Override:</span> → {outcome.nextSceneOverride}
                    </div>
                )}

                {!isExpanded && ((outcome.stateChanges?.length ?? 0) > 2 || (outcome.conditions?.length ?? 0) > 2) && (
                    <div className="text-xs text-purple-500 italic text-center">
                        Click to see more...
                    </div>
                )}
            </div>
        </div>
    );
} 