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
    useReactFlow,
    Connection,
    ReactFlowProvider,
    ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlusSquare, Play, CornerUpLeft, Wand2, Sparkles, Eye, EyeOff, GitBranch, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useLoadGameData } from '@/lib/useLoadGameData';
import { Scene, Choice, Action } from '@/app/types';
import SceneNode from '@/components/Dev/SceneNode';
import SceneForm from '@/components/Dev/SceneForm';
import Modal from '@/components/ui/Modal';
import AddSceneModal from '@/components/Dev/AddSceneModal';
import { saveSceneAndUpdateStore } from '@/lib/sceneHandlers';
import { useUiStore, ContextualControl } from '@/store/uiStore';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import dagre from 'dagre';
import NewChoiceModal from '@/components/Dev/NewChoiceModal';
import ActionNode from '@/components/Dev/ActionNode';
import ActionModal from '@/components/Dev/ActionModal';
import ActionFlow from '@/components/Dev/ActionFlow';

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
    const [editingAction, setEditingAction] = useState<Action | null>(null);
    const { 
        setContextualControls, 
        clearContextualControls, 
        editingScene, 
        setEditingScene,
        deletingScene,
        setDeletingScene,
        deletingAction,
        setDeletingAction,
        actionVisualization,
        toggleActionVisualization,
        toggleConditions,
        toggleOutcomes,
        setFocusedScene,
    } = useUiStore();
    
    const [showNewChoiceModal, setShowNewChoiceModal] = useState(false);
    const [newChoiceConnection, setNewChoiceConnection] = useState<Connection | null>(null);
    const [selectedElement, setSelectedElement] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
    const [focusElement, setFocusElement] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
    const clickTimer = useRef<NodeJS.Timeout | null>(null);

    const { fitView, getNodes, getEdges } = useReactFlow();
    const rfInstance = useRef<ReactFlowInstance | null>(null);

    // Provide the highlight handlers through Zustand
    const setHighlightHandlers = useUiStore(state => state.setHighlightHandlers);

    // Get actions for a scene
    const getSceneActions = useCallback((sceneId: string): string[] => {
        if (!actions) return [];
        return Object.entries(actions)
            .filter(([_, action]) => {
                // Check if the action is used in the scene's choices
                const scene = scenes?.[sceneId];
                const usedInChoices = scene?.choices?.some(choice => choice.nextAction === action.id);
                // Or if it's directly referenced in the scene's actions array
                const directlyReferenced = scene?.actions?.includes(action.id);
                return usedInChoices || directlyReferenced;
            })
            .map(([actionId]) => actionId);
    }, [actions, scenes]);

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

    // Remove the global highlightHandlers object and keep the functions local
    const handleHighlightSceneGroup = useCallback((sceneIds: string[]) => {
        console.log('handleHighlightSceneGroup called with:', sceneIds);
        const nodes = getNodes();
        const edges = getEdges();
        const visibleNodeIds = new Set(sceneIds);
        
        // Find all edges that connect nodes within the group
        const connectedEdges = edges.filter(edge => 
            sceneIds.includes(edge.source) || sceneIds.includes(edge.target)
        );
        
        // Add connected nodes
        connectedEdges.forEach(edge => {
            visibleNodeIds.add(edge.source);
            visibleNodeIds.add(edge.target);
        });

        setRfNodes(nodes.map(node => ({
            ...node,
            hidden: !visibleNodeIds.has(node.id),
            style: { 
                ...node.style, 
                opacity: visibleNodeIds.has(node.id) ? 1 : 0.2,
                transition: 'opacity 0.2s'
            }
        })));

        setRfEdges(edges.map(edge => {
            const isVisible = visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
            return {
                ...edge,
                hidden: !isVisible,
                style: { 
                    ...edge.style, 
                    opacity: isVisible ? 1 : 0.1,
                    transition: 'opacity 0.2s'
                },
                labelStyle: { 
                    opacity: isVisible ? 1 : 0.1,
                    transition: 'opacity 0.2s'
                },
                animated: isVisible
            };
        }));

        setTimeout(() => {
            fitView({
                padding: 0.2,
                duration: 800,
            });
        }, 50);
    }, [getNodes, getEdges, setRfNodes, setRfEdges, fitView]);

    const handleResetHighlight = useCallback(() => {
        const allNodes = getNodes();
        const allEdges = getEdges();
        setRfNodes(allNodes.map(node => ({
            ...node,
            hidden: false,
            style: { ...node.style, opacity: 1 }
        })));
        setRfEdges(allEdges.map(edge => ({
            ...edge,
            hidden: false,
            style: { ...edge.style, opacity: 1 },
            labelStyle: { opacity: 1 },
            animated: false
        })));
        setTimeout(() => {
            fitView({
                padding: 0.2,
                duration: 800,
            });
        }, 50);
    }, [getNodes, getEdges, setRfNodes, setRfEdges, fitView]);

    // Provide the highlight handlers through Zustand
    useEffect(() => {
        setHighlightHandlers({
            onHighlightSceneGroup: handleHighlightSceneGroup,
            onResetHighlight: handleResetHighlight,
        });
    }, [handleHighlightSceneGroup, handleResetHighlight, setHighlightHandlers]);

    const handleEdit = useCallback((sceneId: string) => {
        if (!scenes) return;
        setEditingScene(scenes[sceneId] || null);
    }, [scenes, setEditingScene]);

    const nodeTypes = useMemo(() => ({ 
        scene: SceneNode,
        action: ActionNode,
    }), []);
    
    const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
        console.log('Node click');
        if (clickTimer.current) {
            console.log('Double click detected');
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
            // This is a double click, handled by onNodeDoubleClick
            return;
        }
        clickTimer.current = setTimeout(() => {
            console.log('Single click processed');
            clickTimer.current = null;
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
        console.log('onNodeDoubleClick called');
        event.preventDefault(); // Prevent any default handling
        event.stopPropagation(); // Stop event bubbling
        
        // If we're in action visualization mode and this is a scene node,
        // double-clicking it should show its actions and context
        if (actionVisualization.enabled && !node.id.startsWith('action-')) {
            console.log('Action visualization mode, finding ancestors/descendants');
            setFocusedScene(node.id);
            // Find all ancestors and descendants
            const ancestors = Array.from(findAllAncestors(node.id, scenes || {}));
            const descendants = Array.from(findAllDescendants(node.id, scenes || {}));
            console.log('Ancestors:', ancestors);
            console.log('Descendants:', descendants);
            const visibleScenes = [node.id, ...ancestors, ...descendants];
            console.log('Visible scenes:', visibleScenes);
            handleHighlightSceneGroup(visibleScenes);
            return;
        }
        
        setFocusElement({ type: 'node', id: node.id });
        setSelectedElement(null);
        
        // If this is a scene node, show its ancestors and descendants
        if (!node.id.startsWith('action-') && scenes) {
            console.log('Normal mode, finding ancestors/descendants');
            const ancestors = Array.from(findAllAncestors(node.id, scenes));
            const descendants = Array.from(findAllDescendants(node.id, scenes));
            console.log('Ancestors:', ancestors);
            console.log('Descendants:', descendants);
            const visibleScenes = [node.id, ...ancestors, ...descendants];
            console.log('Visible scenes:', visibleScenes);
            handleHighlightSceneGroup(visibleScenes);
        }
    }, [actionVisualization.enabled, setFocusedScene, handleHighlightSceneGroup, scenes, findAllAncestors, findAllDescendants]);

    const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        setFocusElement({ type: 'edge', id: edge.id });
        setSelectedElement(null);
    }, []);

    const exitFocusMode = useCallback(() => {
        setFocusElement(null);
        // After exiting focus, fit the whole view
        setTimeout(() => fitView({ padding: 0.1 }), 50);
    }, [fitView]);

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

    // Add this helper function
    const createEdgeId = (source: string, target: string) => {
        // Always create edge ID with alphabetically sorted nodes to ensure consistency
        const [first, second] = [source, target].sort();
        return `${first}-${second}`;
    };

    // Modify the initial layout effect
    useEffect(() => {
        if (!scenes || rfNodes.length > 0) return;

        const initialNodes: Node[] = Object.values(scenes).map(scene => ({
            id: scene.id,
            type: 'scene',
            position: { x: 0, y: 0 },
            data: { 
                label: scene.id, 
                onEdit: handleEdit,
            },
        }));

        const edgeMap = new Map<string, {
            source: string;
            target: string;
            isBidirectional: boolean;
            labels: string[];
        }>();

        Object.values(scenes).forEach(scene => {
            scene.choices?.forEach(choice => {
                if (choice.nextNodeId && scenes[choice.nextNodeId]) {
                    const source = scene.id;
                    const target = choice.nextNodeId;
                    const edgeId = createEdgeId(source, target);
                    
                    if (edgeMap.has(edgeId)) {
                        const existingEdge = edgeMap.get(edgeId)!;
                        existingEdge.isBidirectional = true;
                        existingEdge.labels.push(choice.text);
                    } else {
                        edgeMap.set(edgeId, {
                            source,
                            target,
                            isBidirectional: false,
                            labels: [choice.text]
                        });
                    }
                }
            });
        });

        // Convert to React Flow edges with markers
        const initialEdges: Edge[] = Array.from(edgeMap.values()).map(({ source, target, isBidirectional, labels }) => ({
            id: createEdgeId(source, target),
            source,
            target,
            animated: true,
            label: labels.join(' / '),
            data: { isBidirectional },
            markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
            },
            markerStart: isBidirectional ? {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
            } : undefined,
            style: {
                strokeWidth: 2,
            },
        }));
        
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
                const nodeId = focusElement.id;
                if (nodeId.startsWith('action-')) {
                    // For action nodes, show the action and its connected scenes
                    const actionId = nodeId.replace('action-', '');
                    focusIds.add(nodeId); // Add the action node
                    
                    // Find all scenes that use this action
                    Object.entries(scenes).forEach(([sceneId, scene]) => {
                        if (scene.actions?.includes(actionId) || 
                            scene.choices?.some(choice => choice.nextAction === actionId)) {
                            focusIds.add(sceneId);
                            // Also add direct parents and children of these scenes
                            const parents = findDirectParents(sceneId, scenes);
                            const children = findDirectChildren(sceneId, scenes);
                            parents.forEach(id => focusIds.add(id));
                            children.forEach(id => focusIds.add(id));
                        }
                    });

                    // Add actions for all visible scenes if in action visualization mode
                    if (actionVisualization.enabled) {
                        Array.from(focusIds).forEach(id => {
                            if (!id.startsWith('action-')) { // Only for scene nodes
                                const sceneActions = getSceneActions(id);
                                sceneActions.forEach(aId => focusIds.add(`action-${aId}`));
                            }
                        });
                    }
                } else {
                    // For scene nodes, show ancestors and descendants
                    const ancestors = Array.from(findAllAncestors(nodeId, scenes));
                    const descendants = Array.from(findAllDescendants(nodeId, scenes));
                    focusIds = new Set([nodeId, ...ancestors, ...descendants]);

                    // Add actions for all visible scenes if in action visualization mode
                    if (actionVisualization.enabled) {
                        Array.from(focusIds).forEach(id => {
                            const sceneActions = getSceneActions(id);
                            sceneActions.forEach(actionId => focusIds.add(`action-${actionId}`));
                        });
                    }
                }
            } else { // focusElement.type === 'edge'
                const edge = allEdges.find(e => e.id === focusElement.id);
                if (edge) {
                    focusIds = new Set([edge.source, edge.target]);
                    if (actionVisualization.enabled) {
                        const sourceActions = getSceneActions(edge.source);
                        const targetActions = getSceneActions(edge.target);
                        sourceActions.forEach(actionId => focusIds.add(`action-${actionId}`));
                        targetActions.forEach(actionId => focusIds.add(`action-${actionId}`));
                    }
                }
            }
            visibleNodeIds = focusIds;
            highlightedNodeIds = focusIds;
        } else if (selectedElement) {
            // For selection, all scenes are visible but only some are highlighted
            visibleNodeIds = new Set(Object.keys(scenes));
            
            if (selectedElement.type === 'node') {
                const nodeId = selectedElement.id;
                if (nodeId.startsWith('action-')) {
                    // For action nodes, highlight the action and its connected scenes
                    const actionId = nodeId.replace('action-', '');
                    highlightedNodeIds.add(nodeId);
                    
                    // Find all scenes that use this action
                    Object.entries(scenes).forEach(([sceneId, scene]) => {
                        if (scene.actions?.includes(actionId) || 
                            scene.choices?.some(choice => choice.nextAction === actionId)) {
                            highlightedNodeIds.add(sceneId);
                            // Also add direct parents and children of these scenes
                            const parents = findDirectParents(sceneId, scenes);
                            const children = findDirectChildren(sceneId, scenes);
                            parents.forEach(id => highlightedNodeIds.add(id));
                            children.forEach(id => highlightedNodeIds.add(id));
                        }
                    });
                } else {
                    // For scene nodes, highlight direct parents and children
                    const parents = findDirectParents(nodeId, scenes);
                    const children = findDirectChildren(nodeId, scenes);
                    highlightedNodeIds = new Set([nodeId, ...parents, ...children]);
                }
                
                // If action visualization is enabled, show actions only for visible scenes
                if (actionVisualization.enabled) {
                    // First, collect all scenes we want to show actions for
                    const scenesWithActions = new Set(Array.from(highlightedNodeIds).filter(id => !id.startsWith('action-')));
                    
                    // Then add their actions to both visible and highlighted sets
                    scenesWithActions.forEach(sceneId => {
                        const sceneActions = getSceneActions(sceneId);
                        sceneActions.forEach(actionId => {
                            const actionNodeId = `action-${actionId}`;
                            visibleNodeIds.add(actionNodeId);
                            if (highlightedNodeIds.has(sceneId)) {
                                highlightedNodeIds.add(actionNodeId);
                            }
                        });
                    });
                }
            } else { // selectedElement.type === 'edge'
                const edge = allEdges.find(e => e.id === selectedElement.id);
                if (edge) {
                    highlightedNodeIds = new Set([edge.source, edge.target]);
                    if (actionVisualization.enabled) {
                        const sourceActions = getSceneActions(edge.source);
                        const targetActions = getSceneActions(edge.target);
                        sourceActions.forEach(actionId => {
                            const actionNodeId = `action-${actionId}`;
                            visibleNodeIds.add(actionNodeId);
                            highlightedNodeIds.add(actionNodeId);
                        });
                        targetActions.forEach(actionId => {
                            const actionNodeId = `action-${actionId}`;
                            visibleNodeIds.add(actionNodeId);
                            highlightedNodeIds.add(actionNodeId);
                        });
                    }
                }
            }
        }

        // Update node visibility and highlighting
        setRfNodes(allNodes.map(node => {
            const isVisible = visibleNodeIds.has(node.id);
            const isHighlighted = highlightedNodeIds.has(node.id);
            return {
                ...node,
                hidden: !isVisible,
                style: { 
                    ...node.style, 
                    opacity: isHighlighted ? 1 : 0.2,
                    transition: 'opacity 0.2s'
                }
            };
        }));

        // Update edge visibility and highlighting
        setRfEdges(allEdges.map(edge => {
            const sourceVisible = visibleNodeIds.has(edge.source);
            const targetVisible = visibleNodeIds.has(edge.target);
            const sourceHighlighted = highlightedNodeIds.has(edge.source);
            const targetHighlighted = highlightedNodeIds.has(edge.target);
            const isVisible = sourceVisible && targetVisible;
            const isHighlighted = sourceHighlighted && targetHighlighted;

            // Special case: if either end is an action node that's highlighted,
            // show and highlight the edge
            const isActionEdge = edge.source.startsWith('action-') || edge.target.startsWith('action-');
            const hasHighlightedAction = 
                (edge.source.startsWith('action-') && highlightedNodeIds.has(edge.source)) ||
                (edge.target.startsWith('action-') && highlightedNodeIds.has(edge.target));
            
            return {
                ...edge,
                hidden: !isVisible && !(isActionEdge && hasHighlightedAction),
                style: { 
                    ...edge.style, 
                    opacity: (isHighlighted || (isActionEdge && hasHighlightedAction)) ? 1 : 0.1,
                    transition: 'opacity 0.2s'
                },
                labelStyle: { 
                    opacity: (isHighlighted || (isActionEdge && hasHighlightedAction)) ? 1 : 0.1,
                    transition: 'opacity 0.2s'
                },
                animated: isHighlighted || (isActionEdge && hasHighlightedAction)
            };
        }));

    }, [selectedElement, focusElement, scenes, getNodes, getEdges, setRfNodes, setRfEdges, findAllAncestors, findAllDescendants, findDirectParents, findDirectChildren, actionVisualization.enabled, getSceneActions]);

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
            { 
                id: 'toggle-actions', 
                label: actionVisualization.enabled ? 'Hide Actions' : 'Show Actions', 
                icon: actionVisualization.enabled ? EyeOff : Eye, 
                onClick: toggleActionVisualization 
            },
        ];

        // Add conditional controls when actions are enabled and a scene is focused
        if (actionVisualization.enabled && actionVisualization.focusedScene) {
            controls.push(
                { 
                    id: 'toggle-conditions', 
                    label: actionVisualization.showConditions ? 'Hide Conditions' : 'Show Conditions', 
                    icon: GitBranch, 
                    onClick: toggleConditions,
                    keepOpen: true,
                },
                { 
                    id: 'toggle-outcomes', 
                    label: actionVisualization.showOutcomes ? 'Hide Outcomes' : 'Show Outcomes', 
                    icon: GitMerge, 
                    onClick: toggleOutcomes,
                    keepOpen: true,
                }
            );
        }

        setContextualControls(controls);

        return () => {
            clearContextualControls();
        };
    }, [
        setContextualControls, 
        clearContextualControls, 
        handlePlaytest, 
        handleAutoLayout,
        actionVisualization.enabled,
        actionVisualization.focusedScene,
        actionVisualization.showConditions,
        actionVisualization.showOutcomes,
        toggleActionVisualization,
        toggleConditions,
        toggleOutcomes,
    ]);

    const onConnect = useCallback((connection: Connection) => {
        setNewChoiceConnection(connection);
        setShowNewChoiceModal(true);
    }, []);

    // Modify the save handler to use the same edge merging logic
    const handleCreateNewChoice = async (choiceText: string) => {
        if (!newChoiceConnection || !scenes || !setScenes) return;

        const { source, target } = newChoiceConnection;
        if (!source || !target) return;

        const sourceScene = scenes[source];
        if (!sourceScene) return;

        // Check if there's already a choice going the other way
        // const targetScene = scenes[target];
        // const hasReciprocalChoice = targetScene?.choices?.some(c => c.nextNodeId === source);

        // If there's already an edge between these nodes, update it instead of creating a new one
        // const existingEdgeId = createEdgeId(source, target);
        // const existingEdge = rfEdges.find(e => e.id === existingEdgeId);

        const newChoice: Choice = { text: choiceText, nextNodeId: target };
        const updatedScene: Scene = {
            ...sourceScene,
            choices: [...(sourceScene.choices || []), newChoice],
        };

        try {
            await saveSceneAndUpdateStore({
                form: updatedScene,
                editIndex: null,
                scenes: Object.values(scenes),
                scenesObj: scenes,
                setScenes,
                game: gameId,
                setRfEdges: (edges) => {
                    if (typeof edges === 'function') {
                        setRfEdges(currentEdges => {
                            const newEdges = edges(currentEdges);
                            return mergeReciprocalEdges(newEdges);
                        });
                    } else {
                        setRfEdges(mergeReciprocalEdges(edges));
                    }
                },
            });
        } catch (error) {
            console.error('Failed to save scene:', error);
        }

        setShowNewChoiceModal(false);
        setNewChoiceConnection(null);
    };

    // Modify the edge merging function to handle markers
    const mergeReciprocalEdges = (edges: Edge[]): Edge[] => {
        const edgeMap = new Map<string, Edge>();
        
        edges.forEach(edge => {
            const edgeId = createEdgeId(edge.source, edge.target);
            if (edgeMap.has(edgeId)) {
                const existing = edgeMap.get(edgeId)!;
                const labels = new Set([existing.label, edge.label].filter(Boolean));
                existing.label = Array.from(labels).join(' / ');
                // Add start marker if it becomes bidirectional
                existing.markerStart = {
                    type: MarkerType.Arrow,
                    width: 20,
                    height: 20,
                };
            } else {
                const isBidirectional = edges.some(e => 
                    e !== edge && 
                    ((e.source === edge.target && e.target === edge.source) ||
                     (createEdgeId(e.source, e.target) === edgeId))
                );
                
                edgeMap.set(edgeId, { 
                    ...edge, 
                    id: edgeId,
                    markerEnd: {
                        type: MarkerType.Arrow,
                        width: 20,
                        height: 20,
                    },
                    markerStart: isBidirectional ? {
                        type: MarkerType.Arrow,
                        width: 20,
                        height: 20,
                    } : undefined,
                    style: {
                        ...edge.style,
                        strokeWidth: 2,
                    },
                });
            }
        });

        return Array.from(edgeMap.values());
    };

    // Create nodes including action nodes when a scene is focused
    const createNodes = useCallback(() => {
        if (!scenes) return [];

        const nodes: Node[] = Object.values(scenes).map(scene => ({
            id: scene.id,
            type: 'scene',
            position: { x: 0, y: 0 },
            data: { 
                label: scene.id,
                onEdit: handleEdit,
                actions: getSceneActions(scene.id),
            },
        }));

        // Add action nodes if a scene is focused
        if (actionVisualization.enabled && actionVisualization.focusedScene && scenes[actionVisualization.focusedScene]) {
            const focusedScene = scenes[actionVisualization.focusedScene];
            const sceneActions = getSceneActions(actionVisualization.focusedScene);
            const focusedNode = nodes.find(n => n.id === actionVisualization.focusedScene);

            if (focusedNode && sceneActions.length > 0) {
                // Position action nodes in a vertical stack above the scene
                const spacing = 80; // Vertical spacing between nodes
                const startY = focusedNode.position.y - spacing;
                
                sceneActions.forEach((actionId, index) => {
                    nodes.push({
                        id: `action-${actionId}`,
                        type: 'action',
                        position: { 
                            x: focusedNode.position.x + 200, // Fixed distance to the right
                            y: startY - (index * spacing), // Stack vertically
                        },
                        data: {
                            action: actions?.[actionId],
                            onEdit: (id: string) => setEditingAction(actions?.[id.replace('action-', '')] || null),
                        },
                    });
                });
            }
        }

        return nodes;
    }, [scenes, handleEdit, actionVisualization, getSceneActions, actions, setEditingAction]);

    // Update nodes when visualization state changes
    useEffect(() => {
        const newNodes = createNodes();
        setRfNodes(prevNodes => {
            // Preserve positions of existing nodes
            const positionMap = new Map(prevNodes.map(n => [n.id, n.position]));
            return newNodes.map(node => ({
                ...node,
                position: positionMap.get(node.id) || node.position,
            }));
        });
    }, [createNodes, setRfNodes, actionVisualization.enabled, actionVisualization.focusedScene]);

    const handleSaveAction = async (updatedAction: Action) => {
        if (!actions || !setActions) return;
        try {
            const response = await fetch('/api/updateAction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: updatedAction, game: gameId }),
            });
            if (!response.ok) throw new Error('Failed to save action');
            
            setActions({
                ...actions,
                [updatedAction.id]: updatedAction,
            });
            setEditingAction(null);
        } catch (error) {
            console.error('Error saving action:', error);
            alert('Failed to save action.');
        }
    };

    if (loading || !scenes) return <div className="h-screen w-full flex items-center justify-center">Loading game data...</div>;
    if (error) return <div className="h-screen w-full flex items-center justify-center text-red-500">{error}</div>;

  return (
        <div className="h-screen w-full flex">
            <div className="flex-1 relative">
                {actionVisualization.enabled ? (
                    <ActionFlow 
                        actions={actions || {}}
                        scenes={scenes || {}}
                        onActionEdit={(actionId) => setEditingAction(actions?.[actionId] || null)}
                        onSceneEdit={(sceneId) => setEditingScene(scenes?.[sceneId] || null)}
                    />
                ) : (
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
                        {showNewChoiceModal && (
                            <NewChoiceModal
                                onConfirm={handleCreateNewChoice}
                                onCancel={() => {
                                    setShowNewChoiceModal(false);
                                    setNewChoiceConnection(null);
                                }}
                            />
                        )}
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

                        <Modal open={!!editingAction}>
                            {editingAction && (
                                <ActionModal
                                    action={editingAction}
                                    onSave={handleSaveAction}
                                    onClose={() => setEditingAction(null)}
                                    onDelete={() => setDeletingAction(editingAction)}
                                    isEditing={true}
                                    actions={Object.values(actions || {})}
                                    scenes={Object.values(scenes || {})}
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
                            onConnect={onConnect}
                            onInit={instance => rfInstance.current = instance}
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
                )}
            </div>
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