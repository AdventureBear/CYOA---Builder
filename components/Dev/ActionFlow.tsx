import React, {  useEffect, useMemo } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Position,
    MarkerType,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Action, Scene, Condition } from '@/app/types';
import ActionNode from './ActionNode';
import ActionFlowSceneNode from './ActionFlowSceneNode';
import ActionFlowDestinationNode from './ActionFlowDestinationNode';
import ActionFlowOutcomeNode from './ActionFlowOutcomeNode';
import dagre from 'dagre';

interface ActionFlowProps {
    actions: Record<string, Action>;
    scenes: Record<string, Scene>;
    onActionEdit?: (actionId: string) => void;
    onSceneEdit?: (sceneId: string) => void;
}

// Move nodeTypes outside component
const nodeTypes = {
    action: ActionNode,
    scene: ActionFlowSceneNode,
    destination: ActionFlowDestinationNode,
    outcome: ActionFlowOutcomeNode,
} as const;

// Dagre graph setup
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
// const nodeWidth = 172;

// function estimateNodeHeight(node: Node): number {
//     if (node.type === 'outcome') {
//         const outcome = (node.data as any).outcome;
//         let height = 80; // Base height for header and padding
        
//         if (outcome.conditions?.length) {
//             height += 20 + (outcome.conditions.length * 20);
//         }
//         if (outcome.description) {
//             height += 40;
//         }
//         if (outcome.stateChanges?.length) {
//             height += 20 + (outcome.stateChanges.length * 20);
//         }
//         if (outcome.nextSceneOverride) {
//             height += 20;
//         }
//         return Math.min(height, 200); // Cap at max collapsed height
//     }
    
//     // Default heights for other node types
//     switch (node.type) {
//         case 'action':
//             return 100;
//         case 'scene':
//             return 60;
//         case 'destination':
//             return 60;
//         default:
//             return 80;
//     }
// }

// function findActionDependencies(actions: Record<string, Action>): Map<string, Set<string>> {
//     // Map of actionId -> Set of dependent actionIds
//     const dependencies = new Map<string, Set<string>>();
    
//     Object.values(actions).forEach(action => {
//         action.outcomes?.forEach(outcome => {
//             outcome.choices?.forEach(choice => {
//                 if (choice.nextAction) {
//                     // Get or create the set of dependencies for this action
//                     if (!dependencies.has(action.id)) {
//                         dependencies.set(action.id, new Set());
//                     }
//                     dependencies.get(action.id)?.add(choice.nextAction);
//                 }
//             });
//         });
//     });
    
//     return dependencies;
// }

// Add this helper before getLayoutedElements
// function findActionParents(edges: Edge[]): Map<string, string> {
//     const parentMap = new Map<string, string>();
    
//     edges.forEach(edge => {
//         if (edge.source.startsWith('outcome-') && edge.target.startsWith('action-')) {
//             // Find the parent action of this outcome
//             const outcomeParentId = edge.source.split('-')[1]; // Gets the parent action ID from outcome-parentId-index
//             parentMap.set(edge.target.replace('action-', ''), outcomeParentId);
//         }
//     });
    
//     return parentMap;
// }

// interface TreeNode {
//     node: Node;
//     children: TreeNode[];
//     width: number;  // Width of this subtree
//     depth: number;  // Depth in the tree
//     siblingIndex: number; // Position among siblings
// }

interface ActionNode {
    action: Node;
    outcomes: {
        node: Node;
        nextActions: Node[];
        conditions: string[];
    }[];
    parentScenes: Node[];
    childActions: ActionNode[];
    level: number;
    width: number;
}

interface ActionChain {
    action: Node;
    outcomes: {
        node: Node;
        nextActions: ActionChain[];
        conditions: Condition[];
    }[];
    sourceScene?: {
        node: Node;
        isDuplicate: boolean;
    };
    destScene?: {
        node: Node;
        isDuplicate: boolean;
    };
    level: number;
}

interface SceneGroup {
    scene: Node;
    actions: ActionChain[];
    isDuplicate: boolean;
}

const getLayoutedElements = (
    nodes: Node[], 
    edges: Edge[], 
    actions: Record<string, Action>,
    direction = 'LR'
) => {
    const SPACING = {
        HORIZONTAL: 300,    // Space between columns
        VERTICAL: 200,      // Space between different action chains
        OUTCOME: 100,       // Space between outcomes
        ACTION: 150,        // Space between actions in same scene group
    };
    console.log('actions', actions);
    console.log('direction', direction);

    // Debug logging
    console.log('Initial nodes:', nodes.map(n => ({ id: n.id, type: n.type })));
    console.log('Initial edges:', edges.map(e => ({ source: e.source, target: e.target })));

    // Track scene usage count
    const sceneUsageCount = new Map<string, number>();
    edges.forEach(edge => {
        if (edge.source.startsWith('scene-') || edge.target.startsWith('scene-')) {
            const sceneId = edge.source.startsWith('scene-') ? edge.source : edge.target;
            sceneUsageCount.set(sceneId, (sceneUsageCount.get(sceneId) || 0) + 1);
        }
    });

    // Track processed actions to avoid duplicates
    const processedActions = new Set<string>();

    function buildActionChain(
        actionId: string, 
        visited = new Set<string>(), 
        level = 0
    ): ActionChain | null {
        if (visited.has(actionId)) {
            console.log('Cycle detected:', actionId);
            return null;
        }
        visited.add(actionId);

        const actionNode = nodes.find(n => n.id === actionId);
        if (!actionNode) {
            console.log('Action node not found:', actionId);
            return null;
        }

        // Mark this action as processed
        processedActions.add(actionId);

        const outcomes: ActionChain['outcomes'] = [];
        let sourceScene: ActionChain['sourceScene'] = undefined;
        let destScene: ActionChain['destScene'] = undefined;

        // Find source scenes
        edges.forEach(edge => {
            if (edge.target === actionId && edge.source.startsWith('scene-')) {
                const sceneNode = nodes.find(n => n.id === edge.source);
                if (sceneNode) {
                    const isDuplicate = (sceneUsageCount.get(edge.source) || 0) > 1;
                    sourceScene = {
                        node: {
                            ...sceneNode,
                            id: `${sceneNode.id}-for-${actionId}`,
                            data: {
                                ...sceneNode.data,
                                isDuplicate
                            },
                            style: {
                                ...sceneNode.style,
                                backgroundColor: isDuplicate ? '#fef3c7' : '#f0f9ff',
                                borderColor: isDuplicate ? '#d97706' : '#93c5fd'
                            }
                        },
                        isDuplicate
                    };
                }
            }
        });

        // Find all outcomes and their connections
        const actionOutcomes = edges.filter(e => 
            e.source === actionId && 
            e.target.startsWith('outcome-')
        );

        actionOutcomes.forEach(outcomeEdge => {
            const outcomeNode = nodes.find(n => n.id === outcomeEdge.target);
            if (outcomeNode) {
                const nextActions: ActionChain[] = [];
                
                // Find all connections from this outcome
                edges.filter(e => e.source === outcomeEdge.target).forEach(edge => {
                    if (edge.target.startsWith('action-')) {
                        // Don't revisit actions in the same chain
                        if (!visited.has(edge.target)) {
                            const nextChain = buildActionChain(
                                edge.target,
                                new Set(visited),
                                level + 1
                            );
                            if (nextChain) nextActions.push(nextChain);
                        }
                    } else if (edge.target.startsWith('scene-')) {
                        const sceneNode = nodes.find(n => n.id === edge.target);
                        if (sceneNode) {
                            const isDuplicate = (sceneUsageCount.get(edge.target) || 0) > 1;
                            destScene = {
                                node: {
                                    ...sceneNode,
                                    id: `${sceneNode.id}-for-outcome-${outcomeEdge.target}`,
                                    data: {
                                        ...sceneNode.data,
                                        isDuplicate
                                    },
                                    style: {
                                        ...sceneNode.style,
                                        backgroundColor: isDuplicate ? '#fef3c7' : '#f0f9ff',
                                        borderColor: isDuplicate ? '#d97706' : '#93c5fd'
                                    }
                                },
                                isDuplicate
                            };
                        }
                    }
                });

                outcomes.push({
                    node: outcomeNode,
                    nextActions,
                    conditions: (outcomeNode.data as { outcome?: { conditions?: Condition[] } }).outcome?.conditions || []
                });
            }
        });

        return {
            action: actionNode,
            outcomes,
            sourceScene,
            destScene,
            level
        };
    }

    // Find all actions that should be root nodes
    const rootActions = new Set<string>();
    
    // First, add all actions
    nodes.forEach(node => {
        if (node.type === 'action') {
            rootActions.add(node.id);
        }
    });

    // Then remove actions that are targets of other actions (through outcomes)
    edges.forEach(edge => {
        if (edge.source.startsWith('outcome-')) {
            edges.forEach(e2 => {
                if (e2.source === edge.source && e2.target.startsWith('action-')) {
                    rootActions.delete(e2.target);
                }
            });
        }
    });

    console.log('Root actions:', Array.from(rootActions));

    // Build chains for all root actions
    const actionChains: ActionChain[] = [];
    rootActions.forEach(actionId => {
        const chain = buildActionChain(actionId);
        if (chain) {
            actionChains.push(chain);
        }
    });

    // Handle any orphaned actions (not in any chain)
    nodes.forEach(node => {
        if (node.type === 'action' && !processedActions.has(node.id)) {
            console.log('Processing orphaned action:', node.id);
            const chain = buildActionChain(node.id);
            if (chain) {
                actionChains.push(chain);
            }
        }
    });

    console.log('Action chains built:', actionChains.length);

    // Build the new node and edge arrays
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    function layoutChain(
        chain: ActionChain,
        startX: number,
        startY: number
    ): { width: number, height: number } {
        const { action, outcomes, sourceScene, destScene } = chain;

        // Position source scene
        if (sourceScene) {
            sourceScene.node.position = { x: startX, y: startY };
            sourceScene.node.targetPosition = Position.Right;
            sourceScene.node.sourcePosition = Position.Right;
            newNodes.push(sourceScene.node);
            newEdges.push({
                id: `edge-${sourceScene.node.id}-to-${action.id}`,
                source: sourceScene.node.id,
                target: action.id,
                type: 'default',
                animated: true
            });
        }

        // Position action
        action.position = { x: startX + SPACING.HORIZONTAL, y: startY };
        action.targetPosition = Position.Left;
        action.sourcePosition = Position.Right;
        newNodes.push(action);

        let maxY = startY;
        let maxX = startX + SPACING.HORIZONTAL;

        // Position outcomes and their chains
        outcomes.forEach((outcome, i) => {
            const outcomeY = startY + (i * SPACING.OUTCOME);
            outcome.node.position = { 
                x: startX + (SPACING.HORIZONTAL * 1.5), 
                y: outcomeY 
            };
            outcome.node.targetPosition = Position.Left;
            outcome.node.sourcePosition = Position.Right;
            newNodes.push(outcome.node);
            
            // Edge from action to outcome
            newEdges.push({
                id: `edge-${action.id}-to-${outcome.node.id}`,
                source: action.id,
                target: outcome.node.id,
                type: 'default',
                animated: true
            });

            // Position next actions
            const nextX = startX + (SPACING.HORIZONTAL * 2);
            outcome.nextActions.forEach((nextChain, j) => {
                // Edge from outcome to each next action
                newEdges.push({
                    id: `edge-${outcome.node.id}-to-${nextChain.action.id}`,
                    source: outcome.node.id,
                    target: nextChain.action.id,
                    type: 'default',
                    animated: true,
                    style: {
                        stroke: '#f59e0b' // Amber color for choice connections
                    }
                });

                const { width, height } = layoutChain(
                    nextChain,
                    nextX,
                    outcomeY + (j * SPACING.VERTICAL)
                );
                maxX = Math.max(maxX, nextX + width);
                maxY = Math.max(maxY, outcomeY + height);
            });
        });

        // Position destination scene
        if (destScene) {
            destScene.node.position = { 
                x: maxX + SPACING.HORIZONTAL, 
                y: startY 
            };
            destScene.node.targetPosition = Position.Left;
            destScene.node.sourcePosition = Position.Left;
            newNodes.push(destScene.node);
            
            if (outcomes.length > 0) {
                newEdges.push({
                    id: `edge-${outcomes[outcomes.length - 1].node.id}-to-${destScene.node.id}`,
                    source: outcomes[outcomes.length - 1].node.id,
                    target: destScene.node.id,
                    type: 'default',
                    animated: true
                });
            }
        }

        return {
            width: maxX - startX,
            height: Math.max(maxY - startY, SPACING.VERTICAL)
        };
    }

    // After building all action chains, group them by source scene
    function groupActionChainsByScene(chains: ActionChain[]): SceneGroup[] {
        const sceneGroups = new Map<string, SceneGroup>();
        
        chains.forEach(chain => {
            if (chain.sourceScene) {
                // Use the original scene ID (before our cloning) as the key
                const originalSceneId = chain.sourceScene.node.id.split('-for-')[0];
                
                if (!sceneGroups.has(originalSceneId)) {
                    sceneGroups.set(originalSceneId, {
                        scene: {
                            ...chain.sourceScene.node,
                            id: originalSceneId // Use original ID for the shared scene
                        },
                        actions: [],
                        isDuplicate: chain.sourceScene.isDuplicate
                    });
                }
                sceneGroups.get(originalSceneId)?.actions.push(chain);
            } else {
                // Handle chains without source scenes
                sceneGroups.set(`standalone-${chain.action.id}`, {
                    scene: null as unknown as Node,
                    actions: [chain],
                    isDuplicate: false
                });
            }
        });

        return Array.from(sceneGroups.values());
    }

    function layoutSceneGroup(
        group: SceneGroup,
        startX: number,
        startY: number
    ): { width: number, height: number } {
        let maxX = startX;
        let maxY = startY;

        // Position the shared scene if it exists
        if (group.scene) {
            group.scene.position = { x: startX, y: startY };
            group.scene.targetPosition = Position.Right;
            group.scene.sourcePosition = Position.Right;
            newNodes.push(group.scene);
        }

        // Position each action chain in the group
        group.actions.forEach((chain, index) => {
            const actionY = startY + (index * SPACING.ACTION);
            
            // Position the action
            chain.action.position = {
                x: startX + SPACING.HORIZONTAL,
                y: actionY
            };
            chain.action.targetPosition = Position.Left;
            chain.action.sourcePosition = Position.Right;
            newNodes.push(chain.action);

            // Connect shared scene to action
            if (group.scene) {
                newEdges.push({
                    id: `edge-${group.scene.id}-to-${chain.action.id}`,
                    source: group.scene.id,
                    target: chain.action.id,
                    type: 'default',
                    animated: true
                });
            }

            // Position outcomes and their chains
            const currentX = startX + SPACING.HORIZONTAL;
            chain.outcomes.forEach((outcome, i) => {
                const outcomeY = actionY + (i * SPACING.OUTCOME);
                outcome.node.position = { 
                    x: currentX + (SPACING.HORIZONTAL * 0.5), 
                    y: outcomeY 
                };
                outcome.node.targetPosition = Position.Left;
                outcome.node.sourcePosition = Position.Right;
                newNodes.push(outcome.node);
                
                newEdges.push({
                    id: `edge-${chain.action.id}-to-${outcome.node.id}`,
                    source: chain.action.id,
                    target: outcome.node.id,
                    type: 'default',
                    animated: true
                });

                // Position next actions
                const nextX = currentX + SPACING.HORIZONTAL;
                outcome.nextActions.forEach((nextChain, j) => {
                    // Add edge to next action
                    newEdges.push({
                        id: `edge-${outcome.node.id}-to-${nextChain.action.id}`,
                        source: outcome.node.id,
                        target: nextChain.action.id,
                        type: 'default',
                        animated: true,
                        style: {
                            stroke: '#f59e0b' // Amber color for choice connections
                        }
                    });

                    const { width, height } = layoutChain(
                        nextChain,
                        nextX,
                        outcomeY + (j * SPACING.VERTICAL)
                    );
                    maxX = Math.max(maxX, nextX + width);
                    maxY = Math.max(maxY, outcomeY + height);
                });
            });

            // Handle destination scene
            if (chain.destScene) {
                chain.destScene.node.position = { 
                    x: maxX + SPACING.HORIZONTAL, 
                    y: actionY 
                };
                chain.destScene.node.targetPosition = Position.Left;
                chain.destScene.node.sourcePosition = Position.Left;
                newNodes.push(chain.destScene.node);
                
                if (chain.outcomes.length > 0) {
                    const lastOutcome = chain.outcomes[chain.outcomes.length - 1];
                    newEdges.push({
                        id: `edge-${lastOutcome.node.id}-to-${chain.destScene.node.id}`,
                        source: lastOutcome.node.id,
                        target: chain.destScene.node.id,
                        type: 'default',
                        animated: true
                    });
                }
            }
        });

        return {
            width: maxX - startX,
            height: Math.max(maxY - startY, SPACING.VERTICAL)
        };
    }

    // Group chains by their source scene
    const sceneGroups = groupActionChainsByScene(actionChains);

    // Layout each scene group
    let currentY = 0;
    sceneGroups.forEach(group => {
        const { height } = layoutSceneGroup(group, 0, currentY);
        currentY += height + SPACING.VERTICAL;
    });

    console.log('Final nodes:', newNodes.length);
    console.log('Final edges:', newEdges.length);

    return { nodes: newNodes, edges: newEdges };
};

// function findActionReferences(scenes: Record<string, Scene>, actions: Record<string, Action>): Map<string, Set<string>> {
//     // Map of actionId -> Set of sceneIds that reference it
//     const actionSceneMap = new Map<string, Set<string>>();

//     // Helper to add a reference
//     const addReference = (actionId: string, sceneId: string) => {
//         if (!actionSceneMap.has(actionId)) {
//             actionSceneMap.set(actionId, new Set());
//         }
//         actionSceneMap.get(actionId)?.add(sceneId);
//     };

//     // Check all scenes
//     Object.entries(scenes).forEach(([sceneId, scene]) => {
//         // Direct actions in scene
//         scene.actions?.forEach(actionId => {
//             addReference(actionId, sceneId);
//         });
//     });

//     // Check all actions for scene overrides
//     Object.entries(actions).forEach(([actionId, action]) => {
//         action.outcomes?.forEach(outcome => {
//             // Check scene overrides
//             if (outcome.nextSceneOverride) {
//                 const scene = scenes[outcome.nextSceneOverride];
//                 scene?.actions?.forEach(nextActionId => {
//                     if (nextActionId) {
//                         addReference(nextActionId, outcome.nextSceneOverride!);
//                     }
//                 });
//             }
//             // Check next actions in choices
//             outcome.choices?.forEach(choice => {
//                 if (choice.nextAction) {
//                     // Find which scene contains this action
//                     Object.entries(scenes).forEach(([sceneId, scene]) => {
//                         if (scene.actions?.includes(choice.nextAction!) && choice.nextAction) {
//                             addReference(choice.nextAction, sceneId);
//                         }
//                     });
//                 }
//             });
//         });
//     });

//     return actionSceneMap;
// }

function ActionFlowInner({ actions, scenes, onActionEdit, onSceneEdit }: ActionFlowProps) {
    const initialNodes: Node[] = useMemo(() => {
        const nodes: Node[] = [];
        const seenDestinations = new Set<string>();

        // 1. Create all action nodes first
        Object.values(actions).forEach((action) => {
            nodes.push({
                id: `action-${action.id}`,
                type: 'action',
                position: { x: 0, y: 0 },
                data: {
                    action,
                    onEdit: onActionEdit ? () => onActionEdit(action.id) : undefined,
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });
        });

        // 2. Create all outcome nodes
        Object.values(actions).forEach((action) => {
            action.outcomes?.forEach((outcome, outcomeIndex) => {
                const outcomeId = `outcome-${action.id}-${outcomeIndex}`;
                nodes.push({
                    id: outcomeId,
                    type: 'outcome',
                    position: { x: 0, y: 0 },
                    data: { outcome },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
            });
        });

        // 3. Create scene nodes
        Object.entries(scenes).forEach(([sceneId, scene]) => {
            if (scene.actions && scene.actions.length > 0) {
                nodes.push({
                    id: `scene-${sceneId}`,
                    type: 'scene',
                    position: { x: 0, y: 0 },
                    data: {
                        label: sceneId,
                        onEdit: onSceneEdit ? () => onSceneEdit(sceneId) : undefined,
                    },
                    style: {
                        background: '#f0f9ff',
                        border: '1px solid #93c5fd',
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
            }
        });

        // 4. Create destination nodes
        Object.values(actions).forEach((action) => {
            action.outcomes?.forEach((outcome) => {
                outcome.choices?.forEach((choice) => {
                    if (choice.nextNodeId) {
                        const destId = `dest-scene-${choice.nextNodeId}`;
                        if (!seenDestinations.has(destId)) {
                            seenDestinations.add(destId);
                            nodes.push({
                                id: destId,
                                type: 'destination',
                                position: { x: 0, y: 0 },
                                data: {
                                    label: choice.nextNodeId,
                                    type: 'scene',
                                },
                                targetPosition: Position.Left,
                            });
                        }
                    }
                });
            });
        });

        return nodes;
    }, [actions, scenes, onActionEdit, onSceneEdit]);

    const initialEdges: Edge[] = useMemo(() => {
        const edges: Edge[] = [];

        Object.values(actions).forEach((action) => {
            if (action.conditions && action.conditions.length > 0) {
                edges.push({
                    id: `condition-${action.id}`,
                    source: `action-${action.id}`,
                    target: `action-${action.id}`,
                    type: 'default',
                    animated: true,
                    style: {
                        stroke: '#9333ea', // Purple for conditions
                    },
                });
            }
        });

        Object.entries(scenes).forEach(([sceneId, scene]) => {
            scene.actions?.forEach(actionId => {
                edges.push({
                    id: `scene-${sceneId}-to-action-${actionId}`,
                    source: `scene-${sceneId}`,
                    target: `action-${actionId}`,
                    sourceHandle: 'source',
                    targetHandle: 'target',
                    animated: true,
                    style: {
                        strokeWidth: 2,
                        stroke: '#93c5fd', // Blue for scene connections
                    },
                    markerEnd: {
                        type: MarkerType.Arrow,
                        width: 20,
                        height: 20,
                    },
                });
            });
        });

        Object.values(actions).forEach((action) => {
            action.outcomes?.forEach((outcome, outcomeIndex) => {
                const outcomeId = `outcome-${action.id}-${outcomeIndex}`;
                
                edges.push({
                    id: `edge-action-${action.id}-outcome-${outcomeIndex}`,
                    source: `action-${action.id}`,
                    target: outcomeId,
                    sourceHandle: 'source',
                    targetHandle: 'target',
                    animated: true,
                    style: {
                        strokeWidth: 2,
                    },
                    markerEnd: {
                        type: MarkerType.Arrow,
                        width: 20,
                        height: 20,
                    },
                });

                outcome.choices?.forEach((choice) => {
                    if (choice.nextAction) {
                        edges.push({
                            id: `edge-${outcomeId}-to-${choice.nextAction}`,
                            source: outcomeId,
                            target: `action-${choice.nextAction}`,
                            sourceHandle: 'source',
                            targetHandle: 'target',
                            label: choice.text || 'Next',
                            animated: true,
                            style: {
                                strokeWidth: 2,
                                stroke: '#f59e0b',
                            },
                            markerEnd: {
                                type: MarkerType.Arrow,
                                width: 20,
                                height: 20,
                            },
                        });
                    } else if (choice.nextNodeId) {
                        const destId = `dest-scene-${choice.nextNodeId}`;
                        edges.push({
                            id: `edge-${outcomeId}-to-${choice.nextNodeId}`,
                            source: outcomeId,
                            target: destId,
                            sourceHandle: 'source',
                            targetHandle: 'target',
                            label: choice.text || 'Next',
                            animated: true,
                            style: {
                                strokeWidth: 2,
                            },
                            markerEnd: {
                                type: MarkerType.Arrow,
                                width: 20,
                                height: 20,
                            },
                        });
                    }
                });
            });
        });

        return edges;
    }, [actions, scenes]);

    // Apply layout with actions passed
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => getLayoutedElements(
        initialNodes,
        initialEdges,
        actions,
        'LR'
    ), [initialNodes, initialEdges, actions]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    useEffect(() => {
        setNodes(layoutedNodes);
    }, [layoutedNodes, setNodes]);

    useEffect(() => {
        setEdges(layoutedEdges);
    }, [layoutedEdges, setEdges]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

// Wrap with provider to ensure ReactFlow context is available
export default function ActionFlow(props: ActionFlowProps) {
    return (
        <ReactFlowProvider>
            <ActionFlowInner {...props} />
        </ReactFlowProvider>
    );
} 