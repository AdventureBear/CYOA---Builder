import { Scene, Action } from '@/app/types';

// Helper: Find all scenes reachable from the entry scene
export function findReachableScenes(scenes: Scene[], entryId: string): Set<string> {
  const map = new Map(scenes.map(s => [s.id, s]));
  const visited = new Set<string>();
  function dfs(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const scene = map.get(id);
    if (!scene) return;
    for (const choice of scene.choices || []) {
      if (choice.nextNodeId) dfs(choice.nextNodeId);
    }
  }
  dfs(entryId);
  return visited;
}

// Helper: Categorize scenes as disconnected, orphaned, or missing
export function getSceneCategories(scenes: Scene[], actionsObj: Record<string, Action> | null, entryId: string) {
  // Find disconnected scenes
  const reachable = findReachableScenes(scenes, entryId);
  const disconnectedScenes = scenes.filter(s => !reachable.has(s.id));

  // Orphaned scenes
  const orphanedSceneIds = (() => {
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return [];
    const existingSceneIds = new Set(scenes.map((s) => s.id));
    const referencedSceneIds = new Set();
    scenes.forEach(scene => {
      (scene.choices || []).forEach(choice => {
        if (choice.nextNodeId) referencedSceneIds.add(choice.nextNodeId);
      });
    });
    actionsObj && Object.values(actionsObj).forEach((action: Action) => {
      (action.outcomes || []).forEach(outcome => {
        if (outcome.nextSceneOverride) referencedSceneIds.add(outcome.nextSceneOverride);
        (outcome.choices || []).forEach(choice => {
          if (choice.nextNodeId) referencedSceneIds.add(choice.nextNodeId);
        });
      });
    });
    return Array.from(existingSceneIds).filter(
      id => !referencedSceneIds.has(id) && id !== entryId
    );
  })();

  // Missing scenes
  const missingSceneIds = (() => {
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return [];
    const existingSceneIds = new Set(scenes.map((s) => s.id));
    const referencedSceneIds = new Set<string>();
    scenes.forEach((scene) => {
      if (scene.choices && Array.isArray(scene.choices)) {
        scene.choices.forEach((choice) => {
          if (choice.nextNodeId && !existingSceneIds.has(choice.nextNodeId)) {
            referencedSceneIds.add(choice.nextNodeId);
          }
        });
      }
    });
    return Array.from(referencedSceneIds).filter((id) => !existingSceneIds.has(id));
  })();

  return {
    disconnectedScenes,
    orphanedSceneIds,
    missingSceneIds,
  };
}
