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
    addEdge,
    useReactFlow,
    Panel,
    Connection,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlusSquare, Play, CornerUpLeft, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useLoadGameData } from '@/lib/useLoadGameData';
import { Scene, Choice } from '@/app/types';
import SceneNode from '@/components/Dev/SceneNode';
import SceneForm from '@/components/Dev/SceneForm';
import Modal from '@/components/ui/Modal';
import AddSceneModal from '@/components/Dev/AddSceneModal';
import { saveSceneAndUpdateStore, deleteSceneAndUpdateStore } from '@/lib/sceneHandlers';
import { useUiStore, ContextualControl } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import dagre from 'dagre';
import NewChoiceModal from '@/components/Dev/NewChoiceModal';

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

function GameEditor() {
    const params = useParams();
    const gameId = params?.game as string;
    const { scenes, actions, loading, error, setScenes, setActions } = useLoadGameData(gameId);
    
    const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
    const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
    const [isAddSceneModalOpen, setAddSceneModalOpen] = useState(false);
    const { 
        setContextualControls, 
        clearContextualControls, 
        editingScene, 
        setEditingScene,
        deletingScene,
        setDeletingScene,
        deletingAction,
        setDeletingAction,
    } = useUiStore();
    
    const [newChoiceConnection, setNewChoiceConnection] = useState<Connection | null>(null);
    const [selectedElement, setSelectedElement] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
    const [focusElement, setFocusElement] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
    const isInitialLayoutDone = useRef(false);
    const clickTimer = useRef<NodeJS.Timeout | null>(null);

    const { fitView, getNodes, getEdges } = useReactFlow();

    const handleEdit = useCallback((sceneId: string) => {
        if (!scenes) return;
        setEditingScene(scenes[sceneId] || null);
    }, [scenes, setEditingScene]);

    const nodeTypes = useMemo(() => ({ scene: SceneNode }), []);
    
    const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            // This is a double click, handled by onNodeDoubleClick
            return;
        }
        clickTimer.current = setTimeout(() => {
            if (focusElement) return; // Disable single-click selection in focus mode
            setSelectedElement(prev => (prev?.type === 'node' && prev.id === node.id) ? null : { type: 'node', id: node.id });
        }, 200);
    }, [focusElement]);

    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            // This is a double click, handled by onEdgeDoubleClick
            return;
        }
        clickTimer.current = setTimeout(() => {
            if (focusElement) return; // Disable single-click selection in focus mode
            setSelectedElement(prev => (prev?.type === 'edge' && prev.id === edge.id) ? null : { type: 'edge', id: edge.id });
        }, 200);
    }, [focusElement]);

    const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
        setFocusElement({ type: 'node', id: node.id });
        setSelectedElement(null);
    }, []);

    const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        setFocusElement({ type: 'edge', id: edge.id });
        setSelectedElement(null);
    }, []);

    const exitFocusMode = useCallback(() => {
        setFocusElement(null);
        // After exiting focus, fit the whole view
        setTimeout(() => fitView({ padding: 0.1 }), 50);
    }, [fitView]);

    const findDirectParents = useCallback((sceneId: string, scenes: Record<string, Scene>): string[] => {
        return Object.values(scenes)
            .filter(s => s.choices?.some(c => c.nextNodeId === sceneId))
            .map(s => s.id);
    }, []);

    const findDirectChildren = useCallback((sceneId: string, scenes: Record<string, Scene>): string[] => {
        return scenes[sceneId]?.choices?.map(c => c.nextNodeId).filter(Boolean) as string[] || [];
    }, []);

    const findAllAncestors = useCallback((sceneId: string, scenes: Record<string, Scene>): Set<string> => {
        const ancestors = new Set<string>();
        const find = (sId: string) => {
            const parents = findDirectParents(sId, scenes);
            parents.forEach(pId => {
                if (!ancestors.has(pId)) {
                    ancestors.add(pId);
                    find(pId);
                }
            });
        };
        find(sceneId);
        return ancestors;
    }, [findDirectParents]);

    const findAllDescendants = useCallback((sceneId: string, scenes: Record<string, Scene>): Set<string> => {
        const descendants = new Set<string>();
        const find = (sId: string) => {
            const children = findDirectChildren(sId, scenes);
            children.forEach(cId => {
                if (!descendants.has(cId)) {
                    descendants.add(cId);
                    find(cId);
                }
            });
        };
        find(sceneId);
        return descendants;
    }, [findDirectChildren]);

    const handleAutoLayout = useCallback(() => {
        const allNodes = getNodes();
        const allEdges = getEdges();
        const nodesToLayout = allNodes.filter(n => !n.hidden);
        const edgesToLayout = allEdges.filter(e => {
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

    }, [getNodes, getEdges, setRfNodes]);

    // Initial layout effect
    useEffect(() => {
        if (!scenes || rfNodes.length > 0) return; // Prevent re-running after initial setup

        const initialNodes: Node[] = Object.values(scenes).map(scene => ({
            id: scene.id,
            type: 'scene',
            position: { x: 0, y: 0 },
            data: { 
                label: scene.id, 
                onEdit: handleEdit, // Pass the handleEdit function itself
            },
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
    }, [scenes, handleEdit, setRfNodes, setRfEdges, rfNodes.length]);

    // This effect ensures that the onEdit handler on each node is always fresh
    useEffect(() => {
        setRfNodes((currentNodes) =>
            currentNodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onEdit: handleEdit,
                },
            }))
        );
    }, [handleEdit, setRfNodes]);

    // Main effect for highlighting and focus
    useEffect(() => {
        if (!scenes) return;

        const allNodes = getNodes();
        const allEdges = getEdges();

        // If nothing is selected or focused, reset all styles
        if (!selectedElement && !focusElement) {
            setRfNodes(prevNodes => prevNodes.map(n => ({ ...n, hidden: false, style: { ...n.style, opacity: 1 } })));
            setRfEdges(prevEdges => prevEdges.map(e => ({ ...e, hidden: false, style: { ...e.style, opacity: 1 }, animated: false, labelStyle: { opacity: 1 } })));
            return;
        }

        let visibleNodeIds = new Set<string>();
        let highlightedNodeIds = new Set<string>();

        if (focusElement) {
            let focusIds = new Set<string>();
            if (focusElement.type === 'node') {
                focusIds = new Set([focusElement.id, ...Array.from(findAllAncestors(focusElement.id, scenes)), ...Array.from(findAllDescendants(focusElement.id, scenes))]);
            } else { // focusElement.type === 'edge'
                const edge = allEdges.find(e => e.id === focusElement.id);
                if (edge) {
                    const sourceAncestors = findAllAncestors(edge.source, scenes);
                    const sourceDescendants = findAllDescendants(edge.source, scenes);
                    const targetAncestors = findAllAncestors(edge.target, scenes);
                    const targetDescendants = findAllDescendants(edge.target, scenes);
                    focusIds = new Set([edge.source, edge.target, ...Array.from(sourceAncestors), ...Array.from(sourceDescendants), ...Array.from(targetAncestors), ...Array.from(targetDescendants)]);
                }
            }
            visibleNodeIds = focusIds;
            highlightedNodeIds = focusIds;

        } else if (selectedElement) {
            visibleNodeIds = new Set(Object.keys(scenes)); // All nodes are visible
            if (selectedElement.type === 'node') {
                const parents = findDirectParents(selectedElement.id, scenes);
                const children = findDirectChildren(selectedElement.id, scenes);
                highlightedNodeIds = new Set([selectedElement.id, ...parents, ...children]);
            } else { // selectedElement.type === 'edge'
                const edge = allEdges.find(e => e.id === selectedElement.id);
                if (edge) {
                    highlightedNodeIds = new Set([edge.source, edge.target]);
                }
            }
        }

        setRfNodes(allNodes.map(n => ({
            ...n,
            hidden: !visibleNodeIds.has(n.id),
            style: { ...n.style, opacity: highlightedNodeIds.has(n.id) ? 1 : 0.2, transition: 'opacity 0.2s' }
        })));

        setRfEdges(allEdges.map(e => {
            const isVisible = visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target);
            const isHighlighted = highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target);
            return {
                ...e,
                hidden: !isVisible,
                style: { ...e.style, opacity: isHighlighted ? 1 : 0.1, transition: 'opacity 0.2s' },
                labelStyle: { opacity: isHighlighted ? 1 : 0.1, transition: 'opacity 0.2s' },
                animated: isHighlighted
            };
        }));

    }, [selectedElement, focusElement, scenes, getNodes, getEdges, setRfNodes, setRfEdges, findDirectParents, findDirectChildren, findAllAncestors, findAllDescendants]);

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

    const confirmSceneDelete = async () => {
        if (!deletingScene) return;
        try {
            const response = await fetch('/api/deleteScene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sceneId: deletingScene.id, gameId }),
            });
            if (!response.ok) throw new Error('Failed to delete scene');
            
            const newScenes = { ...scenes };
            delete newScenes[deletingScene.id];
            setScenes(newScenes as Record<string, Scene>);

            setDeletingScene(null);
            // Also close the main form if the deleted scene was being edited
            if (editingScene?.id === deletingScene.id) {
                setEditingScene(null);
            }
        } catch (error) {
            console.error('Error deleting scene:', error);
            alert('Failed to delete scene.');
        }
    };

    const confirmActionDelete = async () => {
        if (!deletingAction) return;
        try {
            const response = await fetch(`/api/deleteAction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actionId: deletingAction.id, game: gameId }),
            });
            if (!response.ok) throw new Error('Failed to delete action');
            const newActions = { ...actions };
            delete newActions[deletingAction.id];
            setActions(newActions);
            setDeletingAction(null);
        } catch (error) {
            console.error(error);
            // Optionally, show an error to the user
            alert('Failed to delete action.');
        }
    }

    const handleSave = async (updatedScene: Scene) => {
        if (!scenes || !setScenes) return;
        const scenesArr = Object.values(scenes);
        const editIndex = scenesArr.findIndex(s => s.id === updatedScene.id);
        try {
            await saveSceneAndUpdateStore({
                form: updatedScene,
                game: gameId,
                scenes: scenesArr,
                scenesObj: scenes,
                setScenes: setScenes,
                editIndex: editIndex !== -1 ? editIndex : null,
                setRfEdges: setRfEdges,
            });
            setEditingScene(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save scene');
        }
    };

    const handlePlaytest = useCallback(() => {
        if (gameId) {
            const playUrl = `/play/${gameId}`;
            window.open(playUrl, '_blank');
        }
    }, [gameId]);

    useEffect(() => {
        const controls: ContextualControl[] = [
            { id: 'create-scene', label: 'Create Scene', icon: PlusSquare, onClick: () => setAddSceneModalOpen(true) },
            { id: 'playtest', label: 'Playtest', icon: Play, onClick: handlePlaytest },
            { id: 'auto-layout', label: 'Auto-Layout', icon: Wand2, onClick: handleAutoLayout },
        ];
        
        setContextualControls(controls);

        return () => {
            clearContextualControls();
        };
    }, [setContextualControls, clearContextualControls, handlePlaytest, handleAutoLayout]);

    const onConnect = useCallback((connection: Connection) => {
        setNewChoiceConnection(connection);
    }, []);

    const handleCreateNewChoice = async (choiceText: string) => {
        if (!newChoiceConnection || !scenes || !setScenes) return;

        const { source, target } = newChoiceConnection;
        if (!source || !target) return;

        const sourceScene = scenes[source];
        if (!sourceScene) return;

        const newChoice: Choice = { text: choiceText, nextNodeId: target };

        const updatedScene: Scene = {
            ...sourceScene,
            choices: [...(sourceScene.choices || []), newChoice],
        };

        try {
            const response = await fetch('/api/saveScene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scene: updatedScene, game: gameId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save new choice to server.');
            }

            // 1. Update the store
            const newScenes = { ...scenes, [updatedScene.id]: updatedScene };
            setScenes(newScenes);

            // 2. If the updated scene is currently being edited, refresh the editor's data
            if (editingScene?.id === updatedScene.id) {
                setEditingScene(updatedScene);
            }

            // 3. Add the edge to the graph
            setRfEdges((eds) => addEdge({ ...newChoiceConnection, animated: true, label: choiceText }, eds));

        } catch (error) {
            console.error(error);
            alert(`Error: Could not save new choice. ${error instanceof Error ? error.message : ''}`);
        } finally {
            // 4. Close the modal regardless of outcome
            setNewChoiceConnection(null);
        }
    };

    if (loading || !scenes) return <div className="h-screen w-full flex items-center justify-center">Loading game data...</div>;
    if (error) return <div className="h-screen w-full flex items-center justify-center text-red-500">{error}</div>;

  return (
        <div className="w-full h-full relative">
            <ConfirmationModal
                isOpen={!!deletingScene}
                onClose={() => setDeletingScene(null)}
                onConfirm={confirmSceneDelete}
                title="Delete Scene"
                message={`Are you sure you want to delete the scene "${deletingScene?.id}"? This action cannot be undone.`}
                confirmText="Delete"
            />
            {deletingAction && (
                <ConfirmationModal
                    isOpen={!!deletingAction}
                    onClose={() => setDeletingAction(null)}
                    onConfirm={confirmActionDelete}
                    title="Delete Action"
                    message={`Are you sure you want to delete the action "${deletingAction?.id}"? This action cannot be undone.`}
                    confirmText="Delete"
                />
            )}
            <NewChoiceModal
                isOpen={!!newChoiceConnection}
                onClose={() => setNewChoiceConnection(null)}
                onSubmit={handleCreateNewChoice}
            />
            {isAddSceneModalOpen && (
                <AddSceneModal
                    onAddScene={handleAddScene}
                    onClose={() => setAddSceneModalOpen(false)}
                />
            )}

            <Modal open={!!editingScene}>
                {editingScene && (
                    <SceneForm
                        scene={editingScene}
                        onSave={handleSave}
                        onCancel={() => setEditingScene(null)}
                        onDelete={() => setDeletingScene(editingScene)}
                        actionsObj={actions}
                        allScenes={Object.values(scenes || {})}
                        setActionsObj={setActions}
                    />
                )}
            </Modal>
            
            {focusElement && (
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
                onEdgeClick={onEdgeClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onEdgeDoubleClick={onEdgeDoubleClick}
                onPaneClick={() => {
                    setSelectedElement(null);
                    if (focusElement) {
                        exitFocusMode();
                    }
                }}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }}
            >
                <Controls />
                <MiniMap />
                <Background color={focusElement ? '#eef2f9' : '#aaa'} gap={16} />
            </ReactFlow>
    </div>
  );
}

export default function GameEditorPage() {
    return (
        <ReactFlowProvider>
            <GameEditor />
        </ReactFlowProvider>
  );
} 