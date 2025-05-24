import React, { useState } from 'react';
import { Scene } from '@/app/types';

const sceneTemplate = `{
  "id": "your_scene_id",
  "location": "Location Name",
  "locationImage": "scene.jpg",
  "text": "Describe what happens in this scene.",
  "isRequired": false,
  "actions": ["action_id_1", "action_id_2"],
  "choices": [
    { "text": "First choice", "nextNodeId": "another_scene_id" }
  ]
}`;

interface AddSceneProps {
  sceneId: string;
  onAddScene: (scene: Scene) => void;
  onCancel: () => void;
}

export default function AddScene({ sceneId, onAddScene, onCancel }: AddSceneProps) {
  const [value, setValue] = useState(sceneTemplate.replace('your_scene_id', sceneId));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const scene = JSON.parse(value);
      // Validation for required fields and types
      if (!scene.id || typeof scene.id !== 'string') throw new Error('Scene must have an id (string).');
      if (!scene.location || typeof scene.location !== 'string') throw new Error('Scene must have a location (string).');
      if (!scene.text || typeof scene.text !== 'string') throw new Error('Scene must have text (string).');
      if (typeof scene.isRequired !== 'boolean') throw new Error('Scene must have isRequired (boolean).');
      if (!Array.isArray(scene.choices) || scene.choices.length === 0) throw new Error('Scene must have at least one choice.');
      for (const choice of scene.choices) {
        if (!choice.text || typeof choice.text !== 'string') throw new Error('Each choice must have text (string).');
        if (!choice.nextNodeId || typeof choice.nextNodeId !== 'string') throw new Error('Each choice must have nextNodeId (string).');
      }
      if (scene.actions && !Array.isArray(scene.actions)) throw new Error('Actions must be an array of strings.');
      if (scene.locationImage && typeof scene.locationImage !== 'string') throw new Error('locationImage must be a string.');
      // Save to backend
      const res = await fetch('/api/persistScene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scene),
      });
      if (!res.ok) throw new Error('Failed to save scene to server.');
      setSuccess(true);
      setLoading(false);
      onAddScene(scene);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-amber-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Add a Scene</h1>
      <p className="mb-4 text-center max-w-xl">Paste or edit a scene object below. Use the template as a guide.</p>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-4">
        <textarea
          className="w-full h-64 p-2 rounded bg-[#222] text-amber-50 font-mono border border-amber-900"
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-400 font-bold">{error}</div>}
        {success && <div className="text-green-400 font-bold">Scene saved!</div>}
        <div className="flex gap-4">
          <button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded shadow" disabled={loading}>{loading ? 'Saving...' : 'Add Scene'}</button>
          <button type="button" className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded shadow" onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 