'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Scene } from '@/app/types';

function getSceneFilenames(game: string) {
  // For now, hardcode for cute-animals; in a real app, fetch from API
  if (game === 'cute-animals') {
    return [
      'scene-intro.json',
      'scene-oak_tree.json',
      'scene-nut_grove.json',
      'scene-riverbank.json',
    ];
  }
  // For new games, return empty or fetch dynamically
  return [];
}

const defaultScene: Scene = {
  id: '',
  name: '',
  description: '',
  location: '',
  season: '',
  isRequired: false,
  choices: [{ text: '', nextNodeId: '' }],
  actions: [],
  locationImage: '',
};

async function saveSceneToDisk(scene: Scene, game: string) {
  const res = await fetch('/api/saveScene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scene, game }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save scene');
  }
}

export default function SceneManager() {
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';
  const scenesObj = useGameStore((state) => state.scenes);
  const setScenes = useGameStore((state) => state.setScenes);
  const scenes: Scene[] = scenesObj ? Object.values(scenesObj) : [];
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Scene>(defaultScene);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  function openAddModal() {
    setForm(defaultScene);
    setEditIndex(null);
    setShowModal(true);
  }
  function openEditModal(idx: number) {
    if (!scenes) return;
    setForm(scenes[idx]);
    setEditIndex(idx);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setForm(defaultScene);
    setEditIndex(null);
  }
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }
  function handleActionsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, actions: e.target.value.split(',').map(a => a.trim()).filter(Boolean) });
  }
  function handleChoiceChange(idx: number, field: keyof Scene['choices'][0], value: string) {
    const newChoices = [...form.choices];
    newChoices[idx] = { ...newChoices[idx], [field]: value };
    setForm({ ...form, choices: newChoices });
  }
  function addChoice() {
    setForm({ ...form, choices: [...form.choices, { text: '', nextNodeId: '' }] });
  }
  function removeChoice(idx: number) {
    setForm({ ...form, choices: form.choices.filter((_, i) => i !== idx) });
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let updatedScenes: Record<string, Scene> = scenesObj ? { ...scenesObj } : {};
    let sceneToSave: Scene | undefined = undefined;
    if (editIndex === null) {
      updatedScenes[form.id] = form;
      sceneToSave = form;
    } else if (scenes[editIndex]) {
      updatedScenes[scenes[editIndex].id] = form;
      sceneToSave = form;
    }
    setScenes(updatedScenes);
    try {
      if (!sceneToSave) throw new Error('No scene to save');
      await saveSceneToDisk(sceneToSave, game);
      closeModal();
    } catch (err: any) {
      alert(err.message);
    }
  }
  function confirmDelete(idx: number) {
    setDeleteIndex(idx);
  }
  function handleDelete() {
    if (deleteIndex !== null && scenesObj && scenes[deleteIndex]) {
      const updatedScenes = { ...scenesObj };
      delete updatedScenes[scenes[deleteIndex].id];
      setScenes(updatedScenes);
      setDeleteIndex(null);
    }
  }
  function cancelDelete() {
    setDeleteIndex(null);
  }

  useEffect(() => {
    async function fetchScenes() {
      const res = await fetch(`/api/games/${game}/`);
      const { scenes } = await res.json();
      setScenes(scenes);
    }
    if (!scenesObj) fetchScenes();
  }, [game, scenesObj, setScenes]);

  if (!scenesObj) {
    return <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading scenes...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Scene Manager</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        <ul style={{ marginTop: 16, padding: 0, listStyle: 'none', width: '100%' }}>
          {scenes.map((scene, idx) => (
            <li key={scene.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px #0001', padding: '6px 12px', borderRadius: 8, marginBottom: 6, fontSize: 15, width: '100%', minWidth: 0 }}>
              <div style={{ flex: 2, fontWeight: 700, color: '#b35c1e', fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scene.location}</div>
              <div style={{ flex: 1, color: '#64748b', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>({scene.id})</div>
              <div style={{ flex: 4, color: '#334155', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scene.description.slice(0, 60) || '...'}</div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => openEditModal(idx)}>Edit</button>
                <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => confirmDelete(idx)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Scene</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 600, boxShadow: '0 4px 24px #0002', maxWidth: 1080, width: '100%' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{editIndex === null ? 'Add Scene' : 'Edit Scene'}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} disabled={editIndex !== null} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Location</label>
              <input name="location" value={form.location} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Location Image</label>
              <input name="locationImage" value={form.locationImage} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Is Required</label>
              <input type="checkbox" name="isRequired" checked={form.isRequired} onChange={handleFormChange} style={{ marginLeft: 12 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Actions (comma separated)</label>
              <input name="actions" value={(form.actions || []).join(', ')} onChange={handleActionsChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 16 }}>Choices</label>
                <button type="button" onClick={addChoice} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
              </div>
              {form.choices.map((choice, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, background: '#f3f4f6', borderRadius: 6, padding: 8 }}>
                  <input placeholder="Text" value={choice.text} onChange={e => handleChoiceChange(idx, 'text', e.target.value)} required style={{ flex: 2, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                  <input placeholder="Next Node ID" value={choice.nextNodeId} onChange={e => handleChoiceChange(idx, 'nextNodeId', e.target.value)} required style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                  {form.choices.length > 1 && (
                    <button type="button" onClick={() => removeChoice(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={closeModal} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>{editIndex === null ? 'Add' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteIndex !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px #0002', textAlign: 'center' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Delete Scene?</h3>
            <p style={{ color: '#334155', marginBottom: 24 }}>Are you sure you want to delete <strong>{scenes[deleteIndex]?.id}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={cancelDelete} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 