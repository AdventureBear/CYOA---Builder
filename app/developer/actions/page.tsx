'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ActionCondition {
  type: string;
  [key: string]: unknown;
}

interface ActionOutcome {
  description: string;
  stateChanges?: { type: string; [key: string]: unknown }[];
  choices?: { text: string; nextAction: string }[];
  random?: boolean;
  options?: ActionOutcome[];
}

interface Action {
  id: string;
  trigger: string;
  conditions?: ActionCondition[];
  outcomes: ActionOutcome[];
}

function getActionFilenames(game: string) {
  if (game === 'cute-animals') {
    return [
      'action-help_bird.json',
      'action-check_nest.json',
      'action-share_nuts.json',
      'action-help_beaver.json',
      'action-give_stick.json',
      'action-watch_beaver.json',
    ];
  }
  return [];
}

const defaultAction: Action = {
  id: '',
  trigger: 'onEnter',
  conditions: [],
  outcomes: [{ description: '' }],
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
      const filenames = getActionFilenames(game);
      const data = await Promise.all(
        filenames.map(async (filename) => {
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
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleOutcomeChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, idx: number) {
    const newOutcomes = [...form.outcomes];
    newOutcomes[idx] = { ...newOutcomes[idx], description: e.target.value };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addOutcome() {
    setForm({ ...form, outcomes: [...form.outcomes, { description: '' }] });
  }
  function removeOutcome(idx: number) {
    const newOutcomes = form.outcomes.filter((_, i) => i !== idx);
    setForm({ ...form, outcomes: newOutcomes });
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editIndex === null) {
      setActions([...actions, form]);
    } else {
      const updated = [...actions];
      updated[editIndex] = form;
      setActions(updated);
    }
    closeModal();
  }
  function confirmDelete(idx: number) {
    setDeleteIndex(idx);
  }
  function handleDelete() {
    if (deleteIndex !== null) {
      setActions(actions.filter((_, i) => i !== deleteIndex));
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
                    <strong style={{ fontSize: 20 }}>{action.id}</strong> <span style={{ color: '#64748b', fontSize: 16 }}>({action.trigger})</span>
                  </div>
                  <div>
                    <button style={{ marginRight: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => openEditModal(idx)}>Edit</button>
                    <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }} onClick={() => confirmDelete(idx)}>Delete</button>
                  </div>
                </div>
                <div style={{ margin: '12px 0 0 0', color: '#334155', fontSize: 16 }}>{action.outcomes[0]?.description?.slice(0, 80) || ''}...</div>
              </li>
            ))}
          </ul>
        )}
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Action</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px #0002', maxWidth: 420 }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{editIndex === null ? 'Add Action' : 'Edit Action'}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} disabled={editIndex !== null} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Trigger</label>
              <select name="trigger" value={form.trigger} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
                <option value="onEnter">onEnter</option>
                <option value="onExit">onExit</option>
                <option value="onChoice">onChoice</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Outcomes</label>
              {form.outcomes.map((outcome, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <textarea value={outcome.description} onChange={e => handleOutcomeChange(e, idx)} required style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }} />
                  {form.outcomes.length > 1 && (
                    <button type="button" onClick={() => removeOutcome(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOutcome} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>+ Add Outcome</button>
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