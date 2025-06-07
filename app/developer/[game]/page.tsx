'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    MiniMap,
    Edge,
    Node,
    Position,
    MarkerType,
    NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlusSquare, Play, CornerUpLeft, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useLoadGameData } from '@/lib/useLoadGameData';
import { Scene } from '@/app/types';
import SceneNode from '@/components/Dev/SceneNode';
import SceneForm from '@/components/Dev/SceneForm';
import Modal from '@/components/ui/Modal';
import AddSceneModal from '@/components/Dev/AddSceneModal';
import { saveSceneAndUpdateStore } from '@/lib/sceneHandlers';
import { useUiStore } from '@/store/uiStore';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export default function GameEditorPage() {
    const params = useParams();
    const gameId = params?.game as string;
    const { scenes, actions, loading, error, setScenes, setActions } = useLoadGameData(gameId);
    
    const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

    const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
    const [isAddSceneModalOpen, setAddSceneModalOpen] = useState(false);
    const { setContextualControls, clearContextualControls } = useUiStore();
    
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
    const isInitialLayoutDone = useRef(false);
    const clickTimer = useRef<NodeJS.Timeout | null>(null);

    const handleEdit = useCallback((sceneId: string) => {
        if (!scenes) return;
        setSelectedScene(scenes[sceneId] || null);
    }, [scenes]);

    const nodeTypes = useMemo(() => ({ scene: SceneNode }), []);
    
    const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
        }
        clickTimer.current = setTimeout(() => {
            if (focusNodeId) return; // Disable selection in focus mode
            setSelectedNodeId(currentId => currentId === node.id ? null : node.id);
        }, 150);
    }, [focusNodeId]);
    
    const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }
        setFocusNodeId(node.id);
        setSelectedNodeId(null);
    }, []);

    const exitFocusMode = useCallback(() => {
        setFocusNodeId(null);
    }, []);

    const findAllAncestors = useCallback((sceneId: string, scenes: Record<string, Scene>): Set<string> => {
        const ancestors = new Set<string>();
        const find = (sId: string) => {
            // Find parents from choices
            Object.values(scenes).forEach(potentialParent => {
                if (potentialParent.choices?.some(c => c.nextNodeId === sId)) {
                    if (!ancestors.has(potentialParent.id)) {
                        ancestors.add(potentialParent.id);
                        find(potentialParent.id);
                    }
                }
            });
            // Find parent from parentSceneId
            const explicitParentId = scenes[sId]?.parentSceneId;
            if (explicitParentId && !ancestors.has(explicitParentId)) {
                ancestors.add(explicitParentId);
                find(explicitParentId);
            }
        };
        find(sceneId);
        return ancestors;
    }, []);

    const findAllDescendants = useCallback((sceneId: string, scenes: Record<string, Scene>): Set<string> => {
        const descendants = new Set<string>();
        const find = (sId: string) => {
            scenes[sId]?.choices?.forEach(choice => {
                if (choice.nextNodeId) {
                    if (!descendants.has(choice.nextNodeId)) {
                        descendants.add(choice.nextNodeId);
                        find(choice.nextNodeId);
                    }
                }
            });
        };
        find(sceneId);
        return descendants;
    }, []);

    const handleAutoLayout = useCallback(() => {
        const nodesToLayout = rfNodes.filter(n => !n.hidden);
        const edgesToLayout = rfEdges.filter(e => {
            const sourceVisible = nodesToLayout.some(n => n.id === e.source);
            const targetVisible = nodesToLayout.some(n => n.id === e.target);
            return sourceVisible && targetVisible;
        });

        const { nodes: layoutedNodes } = getLayoutedElements(nodesToLayout, edgesToLayout);
        const positionMap = new Map(layoutedNodes.map(n => [n.id, n.position]));
        
        setRfNodes(prevNodes => 
            prevNodes.map(n => ({
                ...n,
                position: positionMap.get(n.id) || n.position
            }))
        );

    }, [rfNodes, rfEdges, setRfNodes]);

    // Initial layout effect
    useEffect(() => {
        if (!scenes || isInitialLayoutDone.current) return;

        const initialNodes: Node[] = Object.values(scenes).map(scene => ({
            id: scene.id,
            type: 'scene',
            position: { x: 0, y: 0 },
            data: { label: scene.id, onEdit: () => handleEdit(scene.id) },
        }));

        const initialEdges: Edge[] = [];
        Object.values(scenes).forEach(scene => {
            scene.choices?.forEach(choice => {
                if (choice.nextNodeId && scenes[choice.nextNodeId]) {
                    initialEdges.push({
                        id: `${scene.id}-${choice.nextNodeId}`,
                        source: scene.id,
                        target: choice.nextNodeId,
                        animated: true,
                        label: choice.text,
                    });
                }
            });
        });
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

        setRfNodes(layoutedNodes);
        setRfEdges(layoutedEdges);
        isInitialLayoutDone.current = true;
    }, [scenes, handleEdit, setRfNodes, setRfEdges]);

    // Focus and selection effect
    useEffect(() => {
        if (!isInitialLayoutDone.current || !scenes) return;

        if (focusNodeId) {
            const ancestorIds = findAllAncestors(focusNodeId, scenes);
            const descendantIds = findAllDescendants(focusNodeId, scenes);
            const connectedIds = new Set<string>([focusNodeId, ...Array.from(ancestorIds), ...Array.from(descendantIds)]);
            
            setRfNodes(prevNodes => prevNodes.map(n => ({
                ...n,
                hidden: !connectedIds.has(n.id),
                style: { ...n.style, opacity: 1 }
            })));
            setRfEdges(prevEdges => prevEdges.map(e => ({
                ...e,
                hidden: !(connectedIds.has(e.source) && connectedIds.has(e.target)),
                style: { ...e.style, opacity: 1 },
                labelStyle: { opacity: 1 },
                animated: true,
            })));

        } else if (selectedNodeId) {
            const parents = new Set<string>();
            Object.values(scenes).forEach(scene => {
                if (scene.choices?.some(c => c.nextNodeId === selectedNodeId)) {
                    parents.add(scene.id);
                }
            });
            const children = new Set<string>();
            scenes[selectedNodeId]?.choices?.forEach(c => c.nextNodeId && children.add(c.nextNodeId));
            
            const primaryNodes = new Set<string>([selectedNodeId, ...Array.from(parents), ...Array.from(children)]);

            setRfNodes(prevNodes => prevNodes.map(n => ({
                ...n,
                hidden: false,
                style: { ...n.style, opacity: primaryNodes.has(n.id) ? 1 : 0.25, transition: 'opacity 0.2s' }
            })));

            setRfEdges(prevEdges => prevEdges.map(e => {
                const shouldHighlight = primaryNodes.has(e.source) && primaryNodes.has(e.target);
                return {
                    ...e,
                    hidden: false,
                    style: { ...e.style, opacity: shouldHighlight ? 1 : 0.15, transition: 'opacity 0.2s' },
                    labelStyle: { opacity: shouldHighlight ? 1 : 0.15, transition: 'opacity 0.2s' },
                    animated: shouldHighlight,
                };
            }));

        } else {
            // Default: all visible, full opacity
            setRfNodes(prevNodes => prevNodes.map(n => ({ ...n, hidden: false, style: { ...n.style, opacity: 1 } })));
            setRfEdges(prevEdges => prevEdges.map(e => ({ ...e, hidden: false, style: { ...e.style, opacity: 1 }, animated: false, labelStyle: { opacity: 1 } })));
        }

    }, [scenes, focusNodeId, selectedNodeId, setRfNodes, setRfEdges, findAllAncestors, findAllDescendants]);

    const handleAddScene = (newSceneId: string) => {
        if (!scenes || !setScenes) return;
        if (scenes[newSceneId]) {
            alert('A scene with this ID already exists.');
            return;
        }
        const newScene: Scene = {
            id: newSceneId, name: '', location: newSceneId.replace(/_/g, ' '),
            description: '', choices: [], actions: [], season: '', isRequired: false,
        };
        setScenes({ ...scenes, [newSceneId]: newScene });
        setAddSceneModalOpen(false);
    };

    const handleSave = async (updatedScene: Scene) => {
        if (!scenes || !setScenes) return;
        const scenesArr = Object.values(scenes);
        const editIndex = scenesArr.findIndex(s => s.id === updatedScene.id);
        try {
            await saveSceneAndUpdateStore({
                form: updatedScene, game: gameId, scenesObj: scenes,
                setScenes: setScenes, scenes: scenesArr,
                editIndex: editIndex !== -1 ? editIndex : null,
            });
            setSelectedScene(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save scene');
        }
    };

    const handlePlaytest = useCallback(() => {
        if (gameId) {
            const playUrl = `/scene/forest_clearing?game=${gameId}`;
            window.open(playUrl, '_blank');
        }
    }, [gameId]);

    useEffect(() => {
        const controls = [
            { label: 'Create Scene', icon: PlusSquare, onClick: () => setAddSceneModalOpen(true) },
            { label: 'Playtest', icon: Play, onClick: handlePlaytest },
            { label: 'Auto-Layout', icon: Wand2, onClick: handleAutoLayout },
        ];
        
        setContextualControls(controls);

        return () => {
            clearContextualControls();
        };
    }, [setContextualControls, clearContextualControls, handlePlaytest, handleAutoLayout]);
    
    if (loading || !scenes) return <div className="h-screen w-full flex items-center justify-center">Loading game data...</div>;
    if (error) return <div className="h-screen w-full flex items-center justify-center text-red-500">{error}</div>;

  return (
        <div className="w-full h-full relative">
            {isAddSceneModalOpen && (
                <AddSceneModal
                    onAddScene={handleAddScene}
                    onClose={() => setAddSceneModalOpen(false)}
                />
            )}

            <Modal open={!!selectedScene}>
                {selectedScene && (
                    <SceneForm
                        scene={selectedScene}
                        onSave={handleSave}
                        onCancel={() => setSelectedScene(null)}
                        actionsObj={actions}
                        allScenes={Object.values(scenes)}
                        setActionsObj={setActions}
                    />
                )}
            </Modal>
            
            {focusNodeId && (
                <Button
                    onClick={exitFocusMode}
                    className="absolute top-4 right-4 z-10"
                >
                    <CornerUpLeft className="mr-2 h-4 w-4" /> Exit Focus
                </Button>
            )}

            <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={() => {
                    setSelectedNodeId(null);
                    setFocusNodeId(null);
                }}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }}
            >
                <Controls />
                <MiniMap />
                <Background color={focusNodeId ? '#eef2f9' : '#aaa'} gap={16} />
            </ReactFlow>
    </div>
  );
} 