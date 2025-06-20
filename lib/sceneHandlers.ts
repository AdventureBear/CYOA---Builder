import { Scene } from "@/app/types";
import { Edge } from 'reactflow';
// import { addEdge } from "reactflow";

// Save a scene and update the store
export async function saveSceneAndUpdateStore({
  form,
  editIndex,
  scenes,
  scenesObj,
  setScenes,
  game,
  setRfEdges,
}: {
  form: Scene;
  editIndex: number | null;
  scenes: Scene[];
  scenesObj: Record<string, Scene> | null;
  setScenes: (scenes: Record<string, Scene>) => void;
  game: string;
  setRfEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
}) {
  const updatedScenes: Record<string, Scene> = scenesObj ? { ...scenesObj } : {};
  let sceneToSave: Scene | undefined = undefined;
  if (editIndex === null) {
    updatedScenes[form.id] = form;
    sceneToSave = form;
  } else if (scenes[editIndex]) {
    updatedScenes[scenes[editIndex].id] = form;
    sceneToSave = form;
  }
  setScenes(updatedScenes);

  // After saving, recalculate all edges to ensure the graph is in sync
  const newEdges: Edge[] = [];
  Object.values(updatedScenes).forEach(scene => {
      scene.choices?.forEach(choice => {
          if (choice.nextNodeId && updatedScenes[choice.nextNodeId]) {
              newEdges.push({
                  id: `${scene.id}-${choice.nextNodeId}`,
                  source: scene.id,
                  target: choice.nextNodeId,
                  animated: true,
                  label: choice.text,
              });
          }
      });
  });
  setRfEdges(newEdges);

  if (!sceneToSave) throw new Error('No scene to save');
  // Save to backend
  const res = await fetch('/api/saveScene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scene: sceneToSave, game }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save scene');
  }
}

export async function deleteSceneAndUpdateStore({
  sceneId,
  gameId,
  scenes,
  setScenes,
}: {
  sceneId: string;
  gameId: string;
  scenes: Record<string, Scene>;
  setScenes: (scenes: Record<string, Scene>) => void;
}) {
  const updatedScenes = { ...scenes };
  delete updatedScenes[sceneId];
  setScenes(updatedScenes);

  const res = await fetch('/api/deleteScene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId, gameId }),
  });

  if (!res.ok) {
    // If the API call fails, revert the state
    setScenes(scenes);
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete scene');
  }
} 