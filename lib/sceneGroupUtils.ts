import { Scene } from '@/app/types';

interface SceneGroup {
    id: string;
    name: string;
    scenes: string[];
    entryPoints: string[]; // True starting points (no parent scene)
    terminalNodes: string[]; // Scenes that only lead back to previous scenes
    size: number;
}

export function findSceneGroups(scenes: Record<string, Scene>): SceneGroup[] {
    const visited = new Set<string>();
    const groups: SceneGroup[] = [];
    let groupId = 0;

    // Build adjacency map (including both outgoing and incoming edges)
    const adjacencyMap = new Map<string, Set<string>>();
    const incomingEdges = new Map<string, Set<string>>();
    
    // Initialize maps
    Object.keys(scenes).forEach(id => {
        adjacencyMap.set(id, new Set());
        incomingEdges.set(id, new Set());
    });

    // Build connections
    Object.values(scenes).forEach(scene => {
        scene.choices?.forEach(choice => {
            if (choice.nextNodeId && scenes[choice.nextNodeId]) {
                adjacencyMap.get(scene.id)?.add(choice.nextNodeId);
                incomingEdges.get(choice.nextNodeId)?.add(scene.id);
            }
        });
    });

    // DFS to find connected components
    function dfs(sceneId: string, group: Set<string>) {
        if (visited.has(sceneId)) return;
        visited.add(sceneId);
        group.add(sceneId);

        // Follow both outgoing and incoming edges to find all connected scenes
        adjacencyMap.get(sceneId)?.forEach(nextId => {
            if (scenes[nextId]) dfs(nextId, group);
        });
        incomingEdges.get(sceneId)?.forEach(prevId => {
            if (scenes[prevId]) dfs(prevId, group);
        });
    }

    // Find all connected components
    Object.keys(scenes).forEach(sceneId => {
        if (!visited.has(sceneId)) {
            const group = new Set<string>();
            dfs(sceneId, group);

            // Find entry points (scenes with no parent)
            const entryPoints = Array.from(group).filter(id => {
                const scene = scenes[id];
                return !scene.parentSceneId;
            });

            // Find terminal nodes (scenes that only lead back to previous scenes)
            const terminalNodes = Array.from(group).filter(id => {
                const scene = scenes[id];
                const outgoingEdges = scene.choices || [];
                
                // Check if all choices either:
                // 1. Lead back to a parent/previous scene
                // 2. Have no nextNodeId (action-only choices)
                return outgoingEdges.every(choice => {
                    if (!choice.nextNodeId) return true;
                    const targetScene = scenes[choice.nextNodeId];
                    // If the target scene doesn't exist or is the parent, it's not a "forward" edge
                    return !targetScene || targetScene.id === scene.parentSceneId;
                });
            });

            // Create a meaningful name for the group based on entry points
            const entryPointNames = entryPoints.map(id => scenes[id].location || id);
            const groupName = entryPointNames.length > 0 
                ? `Group ${groupId + 1}: ${entryPointNames[0]}`
                : `Group ${groupId + 1}`;

            groups.push({
                id: `group-${groupId}`,
                name: groupName,
                scenes: Array.from(group),
                entryPoints,
                terminalNodes,
                size: group.size
            });
            groupId++;
        }
    });

    // Sort groups by size (descending)
    return groups.sort((a, b) => b.size - a.size);
} 