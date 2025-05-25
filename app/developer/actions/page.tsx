'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Action, Trigger, Condition, Outcome, StateChange } from '@/app/types';
import { useSearchParams } from 'next/navigation';

const defaultAction: Action = {
  id: '',
  trigger: 'onEnter',
  outcomes: [],
  conditions: [],
  failMessage: '',
};

async function saveActionToDisk(action: Action, game: string) {
  const res = await fetch('/api/saveAction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, game }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to save action');
  }
}

export default function ActionsManager() {
  const actionsObj = useGameStore((state) => state.actions);
  const setActions = useGameStore((state) => state.setActions);
  const actions: Action[] = actionsObj ? Object.values(actionsObj) : [];
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Action>(defaultAction);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';

  useEffect(() => {
    async function fetchActions() {
      const res = await fetch(`/api/games/${game}/`);
      const { actions } = await res.json();
      setActions(actions);
    }
    if (!actionsObj) fetchActions();
  }, [game, actionsObj, setActions]);

  function openAddModal() {
    setForm(defaultAction);
    setEditIndex(null);
    setShowModal(true);
  }
  function openEditModal(idx: number) {
    if (!actions) return;
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }
  function handleFailMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm({ ...form, failMessage: e.target.value });
  }
  // --- Conditions ---
  function handleConditionChange(idx: number, field: keyof Condition, value: string) {
    const newConditions = [...(form.conditions || [])];
    newConditions[idx] = { ...newConditions[idx], [field]: value };
    setForm({ ...form, conditions: newConditions });
  }
  function addCondition() {
    setForm({ ...form, conditions: [...(form.conditions || []), { type: 'hasItem', key: '', value: '' }] });
  }
  function removeCondition(idx: number) {
    setForm({ ...form, conditions: (form.conditions || []).filter((_, i) => i !== idx) });
  }
  // --- Outcomes ---
  function handleOutcomeChange(idx: number, field: keyof Outcome, value: string) {
    const newOutcomes = [...(form.outcomes || [])];
    newOutcomes[idx] = { ...newOutcomes[idx], [field]: value };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addOutcome() {
    setForm({ ...form, outcomes: [...(form.outcomes || []), { description: '', stateChanges: [] }] });
  }
  function removeOutcome(idx: number) {
    setForm({ ...form, outcomes: (form.outcomes || []).filter((_, i) => i !== idx) });
  }
  // --- StateChanges for Outcomes ---
  function handleStateChangeChange(outIdx: number, scIdx: number, field: keyof StateChange, value: string | number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newStateChanges = [...(newOutcomes[outIdx].stateChanges || [])];
    if (field === 'type' && typeof value === 'string' && !['addItem', 'removeItem', 'setFlag'].includes(value)) return;
    newStateChanges[scIdx] = { ...newStateChanges[scIdx], [field]: value };
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], stateChanges: newStateChanges as StateChange[] };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addStateChange(outIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newStateChanges = [...(newOutcomes[outIdx].stateChanges || []), { type: 'addItem' as const, key: '', amount: 1 }];
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], stateChanges: newStateChanges as StateChange[] };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function removeStateChange(outIdx: number, scIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newStateChanges = newOutcomes[outIdx].stateChanges.filter((_, i) => i !== scIdx);
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], stateChanges: newStateChanges };
    setForm({ ...form, outcomes: newOutcomes });
  }
  // --- Choices for Outcomes ---
  function handleChoiceChange(outIdx: number, choiceIdx: number, field: string, value: string) {
    const newOutcomes = [...(form.outcomes || [])];
    const newChoices = [...(newOutcomes[outIdx].choices || [])];
    newChoices[choiceIdx] = { ...newChoices[choiceIdx], [field]: value };
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], choices: newChoices };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function addChoice(outIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newChoices = [...(newOutcomes[outIdx].choices || []), { text: '', nextAction: '', nextScene: '', resultMessage: '', resultButtonText: '' }];
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], choices: newChoices };
    setForm({ ...form, outcomes: newOutcomes });
  }
  function removeChoice(outIdx: number, choiceIdx: number) {
    const newOutcomes = [...(form.outcomes || [])];
    const newChoices = newOutcomes[outIdx].choices?.filter((_, i) => i !== choiceIdx) || [];
    newOutcomes[outIdx] = { ...newOutcomes[outIdx], choices: newChoices };
    setForm({ ...form, outcomes: newOutcomes });
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let updatedActions: Record<string, Action> = actionsObj ? { ...actionsObj } : {};
    let actionToSave: Action | undefined = undefined;
    if (editIndex === null) {
      updatedActions[form.id] = form;
      actionToSave = form;
    } else if (actions[editIndex]) {
      updatedActions[actions[editIndex].id] = form;
      actionToSave = form;
    }
    setActions(updatedActions);
    try {
      if (!actionToSave) throw new Error('No action to save');
      await saveActionToDisk(actionToSave, game);
      closeModal();
    } catch (err: any) {
      alert(err.message);
    }
  }
  function confirmDelete(idx: number) {
    setDeleteIndex(idx);
  }
  function handleDelete() {
    if (deleteIndex !== null && actionsObj && actions[deleteIndex]) {
      const updatedActions = { ...actionsObj };
      delete updatedActions[actions[deleteIndex].id];
      setActions(updatedActions);
      setDeleteIndex(null);
    }
  }
  function cancelDelete() {
    setDeleteIndex(null);
  }

  if (!actionsObj) {
    return <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading actions...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Actions Manager</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        <ul style={{ marginTop: 16, padding: 0, listStyle: 'none', width: '100%' }}>
          {actions.map((action, idx) => (
            <li key={action.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px #0001', padding: '6px 12px', borderRadius: 8, marginBottom: 6, fontSize: 15, width: '100%', minWidth: 0 }}>
              <div style={{ flex: 2, fontWeight: 700, color: '#b35c1e', fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.id}</div>
              <div style={{ flex: 1, color: '#64748b', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>({action.trigger})</div>
              <div style={{ flex: 4, color: '#334155', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{action.failMessage?.slice(0, 60) || '...'}</div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => openEditModal(idx)}>Edit</button>
                <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }} onClick={() => confirmDelete(idx)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Action</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 600, boxShadow: '0 4px 24px #0002', maxWidth: 1080, width: '100%' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{editIndex === null ? 'Add Action' : 'Edit Action'}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} disabled={editIndex !== null} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Trigger</label>
              <select name="trigger" value={form.trigger} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
                {(['onEnter', 'onExit', 'onChoice', 'onItem', 'onFlag', 'onRep', 'onHealth', 'onAlignment', 'onRandom'] as Trigger[]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Fail Message</label>
              <textarea name="failMessage" value={form.failMessage} onChange={handleFailMessageChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 40 }} />
            </div>
            {/* Conditions */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 16 }}>Conditions</label>
                <button type="button" onClick={addCondition} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
              </div>
              {(form.conditions || []).map((cond, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, background: '#f3f4f6', borderRadius: 6, padding: 8 }}>
                  <select value={cond.type} onChange={e => handleConditionChange(idx, 'type', e.target.value)} style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}>
                    {['hasItem', 'flagSet', 'flagNotSet', 'random', 'reputation', 'doesNotHaveItem'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input placeholder="Key" value={cond.key || ''} onChange={e => handleConditionChange(idx, 'key', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                  <input placeholder="Value" value={cond.value as string || ''} onChange={e => handleConditionChange(idx, 'value', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                  {(cond.type === 'hasItem' || cond.type === 'reputation') && (
                    <select value={cond.comparator || 'gte'} onChange={e => handleConditionChange(idx, 'comparator', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }}>
                      {['gte', 'eq', 'lte', 'neq'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                  {cond.type === 'random' && (
                    <input type="number" step="0.01" min="0" max="1" placeholder="Chance" value={cond.chance ?? ''} onChange={e => handleConditionChange(idx, 'chance', e.target.value)} style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                  )}
                  <button type="button" onClick={() => removeCondition(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Remove</button>
                </div>
              ))}
            </div>
            {/* Outcomes */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 16 }}>Outcomes</label>
                <button type="button" onClick={addOutcome} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
              </div>
              {(form.outcomes || []).map((out, idx) => (
                <div key={idx} style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 8, marginBottom: 8, background: '#f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <input placeholder="Description" value={out.description || ''} onChange={e => handleOutcomeChange(idx, 'description', e.target.value)} style={{ flex: 2, minWidth: 120, padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
                    <button type="button" onClick={() => removeOutcome(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Remove</button>
                  </div>
                  {/* StateChanges for this outcome */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <label style={{ fontWeight: 500, fontSize: 13 }}>State Changes</label>
                      <button type="button" onClick={() => addStateChange(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginLeft: 2 }}>+</button>
                    </div>
                    {(out.stateChanges || []).map((sc, scIdx) => (
                      <div key={scIdx} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <select value={sc.type} onChange={e => handleStateChangeChange(idx, scIdx, 'type', e.target.value)} style={{ flex: 1, minWidth: 70, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}>
                          {['addItem', 'removeItem', 'setFlag'].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <input placeholder="Key" value={sc.key || ''} onChange={e => handleStateChangeChange(idx, scIdx, 'key', e.target.value)} style={{ flex: 1, minWidth: 60, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <input type="number" placeholder="Amount" value={sc.amount ?? ''} onChange={e => handleStateChangeChange(idx, scIdx, 'amount', e.target.value === '' ? 0 : Number(e.target.value))} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <button type="button" onClick={() => removeStateChange(idx, scIdx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                      </div>
                    ))}
                  </div>
                  {/* Choices for this outcome */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <label style={{ fontWeight: 500, fontSize: 13 }}>Choices</label>
                      <button type="button" onClick={() => addChoice(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginLeft: 2 }}>+</button>
                    </div>
                    {(out.choices || []).map((choice, choiceIdx) => (
                      <div key={choiceIdx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 2, background: '#f3f4f6', borderRadius: 4, padding: 4 }}>
                        <input placeholder="Text" value={choice.text || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'text', e.target.value)} style={{ flex: 2, minWidth: 70, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <input placeholder="Next Action" value={choice.nextAction || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'nextAction', e.target.value)} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <input placeholder="Next Scene" value={choice.nextScene || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'nextScene', e.target.value)} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <input placeholder="Result Message" value={choice.resultMessage || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'resultMessage', e.target.value)} style={{ flex: 2, minWidth: 70, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <input placeholder="Button Text" value={choice.resultButtonText || ''} onChange={e => handleChoiceChange(idx, choiceIdx, 'resultButtonText', e.target.value)} style={{ flex: 1, minWidth: 50, padding: 3, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} />
                        <button type="button" onClick={() => removeChoice(idx, choiceIdx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
                      </div>
                    ))}
                  </div>
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