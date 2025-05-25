import React, { useState } from 'react';
import { Scene } from '@/app/types';

const sceneTemplate = `{
  "id": "your_scene_id",
  "location": "Location Name",
  "locationImage": "scene.jpg",
  "description": "Describe what happens in this scene.",
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
  // Form state
  const [tab, setTab] = useState<'form' | 'json'>('form');
  const [id, setId] = useState(sceneId);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [season, setSeason] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [actions, setActions] = useState<string[]>([]);
  const [choices, setChoices] = useState([{ text: '', nextNodeId: '' }]);
  const [jsonValue, setJsonValue] = useState(sceneTemplate.replace('your_scene_id', sceneId));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const scene: Scene = {
        id,
        name,
        location,
        description,
        season,
        isRequired,
        actions,
        choices,
      };
      // Validation
      if (!scene.id) throw new Error('Scene must have an id.');
      if (!scene.name) throw new Error('Scene must have a name.');
      if (!scene.location) throw new Error('Scene must have a location.');
      if (!scene.description) throw new Error('Scene must have a description.');
      if (!scene.choices || scene.choices.length === 0) throw new Error('Scene must have at least one choice.');
      for (const choice of scene.choices) {
        if (!choice.text) throw new Error('Each choice must have text.');
        if (!choice.nextNodeId) throw new Error('Each choice must have nextNodeId.');
      }
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

  // Handle JSON submit
  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const scene = JSON.parse(jsonValue);
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

  // Dynamic choices
  const handleChoiceChange = (idx: number, field: 'text' | 'nextNodeId', value: string) => {
    setChoices(choices => choices.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const addChoice = () => setChoices([...choices, { text: '', nextNodeId: '' }]);
  const removeChoice = (idx: number) => setChoices(choices => choices.filter((_, i) => i !== idx));

  // Dynamic actions
  const handleActionChange = (idx: number, value: string) => {
    setActions(actions => actions.map((a, i) => i === idx ? value : a));
  };
  const addAction = () => setActions([...actions, '']);
  const removeAction = (idx: number) => setActions(actions => actions.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-amber-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Add a Scene</h1>
      <div className="mb-4 flex gap-4">
        <button className={`py-1 px-4 rounded ${tab === 'form' ? 'bg-amber-700 text-white' : 'bg-gray-700 text-amber-100'}`} onClick={() => setTab('form')}>Form</button>
        <button className={`py-1 px-4 rounded ${tab === 'json' ? 'bg-amber-700 text-white' : 'bg-gray-700 text-amber-100'}`} onClick={() => setTab('json')}>Advanced (JSON)</button>
      </div>
      {tab === 'form' ? (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-bold mb-1">Scene ID</label>
              <input className="w-full p-2 rounded bg-[#222] text-amber-50 border border-amber-900" value={id} onChange={e => setId(e.target.value)} disabled={loading} />
            </div>
            <div className="flex-1">
              <label className="block font-bold mb-1">Name</label>
              <input className="w-full p-2 rounded bg-[#222] text-amber-50 border border-amber-900" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-bold mb-1">Location</label>
              <input className="w-full p-2 rounded bg-[#222] text-amber-50 border border-amber-900" value={location} onChange={e => setLocation(e.target.value)} disabled={loading} />
            </div>
            <div className="flex-1">
              <label className="block font-bold mb-1">Season (optional)</label>
              <input className="w-full p-2 rounded bg-[#222] text-amber-50 border border-amber-900" value={season} onChange={e => setSeason(e.target.value)} disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block font-bold mb-1">Description</label>
            <textarea className="w-full h-24 p-2 rounded bg-[#222] text-amber-50 border border-amber-900" value={description} onChange={e => setDescription(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block font-bold mb-1">Is Required?</label>
            <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} disabled={loading} />
          </div>
          <div>
            <label className="block font-bold mb-1">Actions (optional)</label>
            {actions.map((a, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input className="flex-1 p-2 rounded bg-[#222] text-amber-50 border border-amber-900" value={a} onChange={e => handleActionChange(idx, e.target.value)} disabled={loading} />
                <button type="button" className="bg-red-700 text-white px-2 rounded" onClick={() => removeAction(idx)} disabled={loading}>Remove</button>
              </div>
            ))}
            <button type="button" className="bg-amber-700 text-white px-3 py-1 rounded mt-1" onClick={addAction} disabled={loading}>Add Action</button>
          </div>
          <div>
            <label className="block font-bold mb-1">Choices</label>
            {choices.map((c, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input className="flex-1 p-2 rounded bg-[#222] text-amber-50 border border-amber-900" placeholder="Choice text" value={c.text} onChange={e => handleChoiceChange(idx, 'text', e.target.value)} disabled={loading} />
                <input className="flex-1 p-2 rounded bg-[#222] text-amber-50 border border-amber-900" placeholder="Next scene ID" value={c.nextNodeId} onChange={e => handleChoiceChange(idx, 'nextNodeId', e.target.value)} disabled={loading} />
                <button type="button" className="bg-red-700 text-white px-2 rounded" onClick={() => removeChoice(idx)} disabled={loading}>Remove</button>
              </div>
            ))}
            <button type="button" className="bg-amber-700 text-white px-3 py-1 rounded mt-1" onClick={addChoice} disabled={loading}>Add Choice</button>
          </div>
          {error && <div className="text-red-400 font-bold">{error}</div>}
          {success && <div className="text-green-400 font-bold">Scene saved!</div>}
          <div className="flex gap-4">
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded shadow" disabled={loading}>{loading ? 'Saving...' : 'Add Scene'}</button>
            <button type="button" className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded shadow" onClick={onCancel} disabled={loading}>Cancel</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleJsonSubmit} className="w-full max-w-2xl flex flex-col gap-4">
          <textarea
            className="w-full h-64 p-2 rounded bg-[#222] text-amber-50 font-mono border border-amber-900"
            value={jsonValue}
            onChange={e => setJsonValue(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-400 font-bold">{error}</div>}
          {success && <div className="text-green-400 font-bold">Scene saved!</div>}
          <div className="flex gap-4">
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded shadow" disabled={loading}>{loading ? 'Saving...' : 'Add Scene'}</button>
            <button type="button" className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded shadow" onClick={onCancel} disabled={loading}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
} 