"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Action {
  id: string;
  name: string;
  description: string;
  type: string;
  params: Record<string, any>;
}

const defaultAction: Action = {
  id: '',
  name: '',
  description: '',
  type: '',
  params: {},
};

export default function ActionManager() {
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Action>(defaultAction);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchActions() {
      setLoading(true);
      const filenames = await fetch(`/api/listActions?game=${game}`).then(res => res.json());
      const data = await Promise.all(
        filenames.map(async (filename: string) => {
          const res = await fetch(`/games/${game}/actions/${filename}`);
          return res.json();
        })
      );
      setActions(data);
      setLoading(false);
    }
    fetchActions();
  }, [game]);

  function openAddModal() {
    setForm(defaultAction);
    setEditIndex(null);
    setShowModal(true);
  }
  function openEditModal(idx: number) {
    setForm(actions[idx]);
    setEditIndex(idx);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setForm(defaultAction);
    setEditIndex(null);
  }
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }
  function handleParamsChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    try {
      setForm({ ...form, params: JSON.parse(e.target.value) });
    } catch {
      // Ignore parse errors for now
    }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editIndex === null) {
      setActions([...actions, form]);
      // TODO: Save new action to disk via API
    } else {
      const updated = [...actions];
      updated[editIndex] = form;
      setActions(updated);
      // TODO: Update action on disk via API
    }
    closeModal();
  }
  function confirmDelete(idx: number) {
    setDeleteIndex(idx);
  }
  function handleDelete() {
    if (deleteIndex !== null) {
      setActions(actions.filter((_, i) => i !== deleteIndex));
      // TODO: Delete action from disk via API
      setDeleteIndex(null);
    }
  }
  function cancelDelete() {
    setDeleteIndex(null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Action Manager</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        {loading ? (
          <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading actions...</div>
        ) : (
          <ul style={{ marginTop: 32, padding: 0, listStyle: 'none' }}>
            {actions.map((action, idx) => (
              <li key={action.id} style={{ marginBottom: 24, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px #0001', padding: 20, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 20 }}>{action.name}</strong> <span style={{ color: '#64748b', fontSize: 16 }}>({action.id})</span>
                  </div>
                  <div>
                    <button style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => openEditModal(idx)}>Edit</button>
                    <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => confirmDelete(idx)}>Delete</button>
                  </div>
                </div>
                <div style={{ margin: '12px 0 0 0', color: '#334155', fontSize: 16 }}>{action.description.slice(0, 80)}...</div>
              </li>
            ))}
          </ul>
        )}
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Action</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0002', maxWidth: 480 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{editIndex === null ? 'Add Action' : 'Edit Action'}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} disabled={editIndex !== null} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Name</label>
              <input name="name" value={form.name} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Type</label>
              <input name="type" value={form.type} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Params (JSON)</label>
              <textarea name="params" value={JSON.stringify(form.params, null, 2)} onChange={handleParamsChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60, fontFamily: 'monospace' }} />
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
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Delete Action?</h3>
            <p style={{ color: '#334155', marginBottom: 24 }}>Are you sure you want to delete <strong>{actions[deleteIndex]?.id}</strong>?</p>
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