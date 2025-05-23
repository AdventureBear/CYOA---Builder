"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SceneChoice {
  text: string;
  nextNodeId: string;
}

interface Scene {
  id: string;
  location: string;
  locationImage: string;
  text: string;
  isRequired: boolean;
  actions: string[];
  choices: SceneChoice[];
}

const defaultScene: Scene = {
  id: '',
  location: '',
  locationImage: '',
  text: '',
  isRequired: false,
  actions: [],
  choices: [{ text: '', nextNodeId: '' }],
};

export default function SceneManager() {
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Scene>(defaultScene);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchScenes() {
      setLoading(true);
      const filenames = await fetch(`/api/listScenes?game=${game}`).then(res => res.json());
      const data = await Promise.all(
        filenames.map(async (filename: string) => {
          const res = await fetch(`/games/${game}/scenes/${filename}`);
          return res.json();
        })
      );
      setScenes(data);
      setLoading(false);
    }
    fetchScenes();
  }, [game]);

  function openAddModal() {
    setForm(defaultScene);
    setEditIndex(null);
    setShowModal(true);
  }
  function openEditModal(idx: number) {
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
  function handleChoiceChange(idx: number, field: keyof SceneChoice, value: string) {
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
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editIndex === null) {
      setScenes([...scenes, form]);
      // TODO: Save new scene to disk via API
    } else {
      const updated = [...scenes];
      updated[editIndex] = form;
      setScenes(updated);
      // TODO: Update scene on disk via API
    }
    closeModal();
  }
  function confirmDelete(idx: number) {
    setDeleteIndex(idx);
  }
  function handleDelete() {
    if (deleteIndex !== null) {
      setScenes(scenes.filter((_, i) => i !== deleteIndex));
      // TODO: Delete scene from disk via API
      setDeleteIndex(null);
    }
  }
  function cancelDelete() {
    setDeleteIndex(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Scene Manager</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        {loading ? (
          <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading scenes...</div>
        ) : (
          <ul style={{ marginTop: 32, padding: 0, listStyle: 'none' }}>
            {scenes.map((scene, idx) => (
              <li key={scene.id} style={{ marginBottom: 24, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px #0001', padding: 20, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 20 }}>{scene.location}</strong> <span style={{ color: '#64748b', fontSize: 16 }}>({scene.id})</span>
                  </div>
                  <div>
                    <button style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => openEditModal(idx)}>Edit</button>
                    <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => confirmDelete(idx)}>Delete</button>
                  </div>
                </div>
                <div style={{ margin: '12px 0 0 0', color: '#334155', fontSize: 16 }}>{scene.text.slice(0, 80)}...</div>
              </li>
            ))}
          </ul>
        )}
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Scene</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0002', maxWidth: 480 }}>
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
              <label style={{ fontWeight: 600 }}>Text</label>
              <textarea name="text" value={form.text} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Is Required</label>
              <input type="checkbox" name="isRequired" checked={form.isRequired} onChange={handleFormChange} style={{ marginLeft: 12 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Actions (comma separated)</label>
              <input name="actions" value={form.actions.join(', ')} onChange={handleActionsChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Choices</label>
              {form.choices.map((choice, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                  <input placeholder="Text" value={choice.text} onChange={e => handleChoiceChange(idx, 'text', e.target.value)} required style={{ flex: 2, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                  <input placeholder="Next Node ID" value={choice.nextNodeId} onChange={e => handleChoiceChange(idx, 'nextNodeId', e.target.value)} required style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                  {form.choices.length > 1 && (
                    <button type="button" onClick={() => removeChoice(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addChoice} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>+ Add Choice</button>
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