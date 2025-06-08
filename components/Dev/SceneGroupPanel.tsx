import React from 'react';
import { ChevronRight, Focus } from 'lucide-react';
import { Scene } from '@/app/types';
import { findSceneGroups } from '@/lib/sceneGroupUtils';
import { useGameStore } from '@/store/gameStore';

interface SceneGroupPanelProps {
    onHighlightSceneGroup: (sceneIds: string[]) => void;
    onResetHighlight: () => void;
}

function SceneGroupPanelContent({ onHighlightSceneGroup, onResetHighlight }: SceneGroupPanelProps) {
    const { scenes: scenesObj } = useGameStore();
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = React.useState('');
    const groups = findSceneGroups(scenesObj || {});

    const toggleGroup = (groupId: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
            // When collapsing, show all nodes
            onResetHighlight();
        } else {
            newExpanded.add(groupId);
            // Auto-focus when expanding a group
            const groupScenes = groups.find(g => g.id === groupId)?.scenes || [];
            if (groupScenes.length > 0) {
                onHighlightSceneGroup(groupScenes);
            }
        }
        setExpandedGroups(newExpanded);
    };

    const handleFocusScene = (sceneId: string) => {
        onHighlightSceneGroup([sceneId]);
    };

    const filteredGroups = React.useMemo(() => {
        if (!searchTerm || !scenesObj) return groups;
        return groups.map(group => ({
            ...group,
            scenes: group.scenes.filter(sceneId => {
                const scene = scenesObj[sceneId];
                return scene.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sceneId.toLowerCase().includes(searchTerm.toLowerCase());
            })
        })).filter(group => group.scenes.length > 0);
    }, [groups, scenesObj, searchTerm]);

    if (!scenesObj) {
        return <div className="p-4">Loading scenes...</div>;
    }

    return (
        <>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search scenes..." 
                    className="flex-1 px-2 py-1 rounded border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                />
            </div>
            <div className="overflow-y-auto px-2 pt-2">
                {filteredGroups.map((group, index) => (
                    <AccordionSection 
                        key={group.id} 
                        title={`Group ${index + 1}: ${group.scenes.length} Scene${group.scenes.length === 1 ? '' : 's'}`}
                        open={expandedGroups.has(group.id)}
                        onClick={() => toggleGroup(group.id)}
                        color={group.scenes.length === 1 ? "#fae6e6" : "#e6fae6"}
                    >
                        <div className="bg-white">
                            {group.scenes.map((sceneId, idx) => (
                                <div 
                                    key={sceneId} 
                                    className={`flex items-center justify-between group border-b border-slate-200 hover:bg-blue-50 hover:shadow-md hover:scale-[1.03] transition ${
                                        idx === group.scenes.length - 1 ? 'border-b-0' : ''
                                    }`}
                                >
                                    <div className="px-2 py-1 flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-800 truncate">
                                            {scenesObj[sceneId].location || sceneId}
                                        </div>
                                        <div className="text-[12px] text-slate-600 truncate">
                                            {scenesObj[sceneId].description || ''}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFocusScene(sceneId);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded-md transition-opacity mr-1"
                                        title="Focus on this scene"
                                    >
                                        <Focus className="w-3 h-3 text-blue-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </AccordionSection>
                ))}
            </div>
        </>
    );
}

function AccordionSection({ title, open, onClick, children, color }: { title: string; open: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
    return (
        <div
            className="mb-2 rounded-lg overflow-hidden border border-slate-300"
            style={color ? { background: color } : {}}
        >
            <button
                className="flex items-center w-full px-2 py-1 text-left font-semibold text-[13px] text-slate-700 rounded-none"
                onClick={onClick}
            >
                <span className={`mr-2 transition-transform ${open ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                </span>
                <span className="flex-1">{title}</span>
            </button>
            {open && <div className="mt-1">{children}</div>}
        </div>
    );
}

export default function SceneGroupPanel({ onHighlightSceneGroup, onResetHighlight }: SceneGroupPanelProps) {
    return <SceneGroupPanelContent onHighlightSceneGroup={onHighlightSceneGroup} onResetHighlight={onResetHighlight} />;
} 