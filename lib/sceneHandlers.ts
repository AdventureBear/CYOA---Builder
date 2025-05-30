import { Scene } from "@/app/types";

// Save a scene and update the store
export async function saveSceneAndUpdateStore({
  form,
  editIndex,
  scenes,
  scenesObj,
  setScenes,
  game,
}: {
  form: Scene;
  editIndex: number | null;
  scenes: Scene[];
  scenesObj: Record<string, Scene> | null;
  setScenes: (scenes: Record<string, Scene>) => void;
  game: string;
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