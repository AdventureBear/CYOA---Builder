import { Scene } from "@/app/types";

export function updateBreadcrumbs(
    currentBreadcrumbs: string[],
    newSceneId: string,
    scenes: Record<string, Scene>
  ): string[] {
    // If already at the new scene, do nothing
    if (currentBreadcrumbs[currentBreadcrumbs.length - 1] === newSceneId) {
      return currentBreadcrumbs;
    }
  
    // Walk up the breadcrumbs to find a common ancestor
    const newPath = [...currentBreadcrumbs];
    while (newPath.length > 0) {
      const lastSceneId = newPath[newPath.length - 1];
      const children = Object.values(scenes).filter(
        (scene) => scene.parentSceneId === lastSceneId
      ).map(scene => scene.id);
  
      if (children.includes(newSceneId)) {
        // Found the parent, push the new scene
        newPath.push(newSceneId);
        return newPath;
      }
      // Pop and try again
      newPath.pop();
    }
  
    // If not found, start a new path from the new scene (or its root)
    // Optionally, you could walk up parentSceneId to build the full path
    const path: string[] = [];
    let currentId: string | undefined = newSceneId;
    while (currentId) {
      path.unshift(currentId);
      currentId = scenes[currentId]?.parentSceneId;
    }
    return path;
  }