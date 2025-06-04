import React, { useState } from 'react';
import type { Scene, Action } from '@/app/types';

interface SceneActionRow {
  id: string;
  trigger: string;
  outcome: string;
}

interface SceneActionsBoxProps {
  form: Scene;
  setForm: (scene: Scene) => void;
  actionsObj: Record<string, Action> | null;
  onEditAction: (actionId: string) => void;
  onUpdateActionOutcome: (actionId: string, outcome: string) => void;
}

export function SceneActionsBox({ form, setForm, actionsObj, onEditAction, onUpdateActionOutcome }: SceneActionsBoxProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActionId, setNewActionId] = useState('');
  const [selectedExisting, setSelectedExisting] = useState('');
  const actions = actionsObj ? Object.values(actionsObj) : [];
  const triggers = ['onEnter', 'onExit', 'onChoice', 'onItem', 'onFlag', 'onRep', 'onHealth', 'onAlignment', 'onRandom'];

  // Map form.actions (string[]) to editable rows (SceneActionRow[])
  const actionRows: SceneActionRow[] = (form.actions || []).map((id: string) => {
    // Try to get trigger/outcome from actionsObj, else default
    const found = actionsObj && actionsObj[id];
    return {
      id,
      trigger: found && (found as Action).trigger ? (found as Action).trigger : 'onEnter',
      outcome: found && Array.isArray((found as Action).outcomes) && (found as Action).outcomes.length > 0 ? (found as Action).outcomes[0].description || '' : '',
    };
  });

  function updateActions(newRows: SceneActionRow[]) {
    setForm({ ...form, actions: newRows.map(row => row.id) });
  }

  function handleAddAction() {
    setShowAddModal(true);
    setNewActionId('');
    setSelectedExisting('');
  }
  function handleSaveNewAction() {
    const actionId = selectedExisting || newActionId.trim();
    if (!actionId) return;
    if ((form.actions || []).includes(actionId)) return;
    updateActions([...actionRows, { id: actionId, trigger: 'onEnter', outcome: '' }]);
    setShowAddModal(false);
  }
  function handleDelete(idx: number) {
    const newRows = actionRows.filter((_, i) => i !== idx);
    updateActions(newRows);
  }
  function handleTriggerChange(idx: number, value: string) {
    const newRows = actionRows.map((a, i) => i === idx ? { ...a, trigger: value } : a);
    updateActions(newRows);
  }
  function handleOutcomeChange(idx: number, value: string) {
    const newRows = actionRows.map((a, i) => i === idx ? { ...a, outcome: value } : a);
    updateActions(newRows);
    // Persist outcome to global actions store
    onUpdateActionOutcome(actionRows[idx].id, value);
  }

  return (
    <div style={{ background: '#f9f6e7', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <label style={{ fontWeight: 600, fontSize: 16 }}>Actions</label>
        <button type="button" onClick={handleAddAction} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
      </div>
      {/* Header row */}
      {actionRows.length > 0 && (
        <div style={{ display: 'flex', gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
          <div style={{ flex: 2 }}>Action</div>
          <div style={{ flex: 1 }}>Trigger</div>
          <div style={{ flex: 3 }}>Outcome</div>
          <div style={{ width: 80 }}></div>
        </div>
      )}
      {/* Action rows */}
      {actionRows.map((a, idx) => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <input value={a.id} readOnly style={{ flex: 2, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, background: '#f9fafb' }} />
          <select value={a.trigger} onChange={e => handleTriggerChange(idx, e.target.value)} style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14 }}>
            {triggers.map((t: string) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={a.outcome || ''} onChange={e => handleOutcomeChange(idx, e.target.value)} placeholder="Outcome note" style={{ flex: 3, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14 }} />
          <button type="button" onClick={() => onEditAction(a.id)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginRight: 2 }}>Edit</button>
          <button type="button" onClick={() => handleDelete(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Delete</button>
        </div>
      ))}
      {/* If no actions, show only Add button */}
      {actionRows.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <button type="button" onClick={handleAddAction} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
        </div>
      )}
      {/* Add Action Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, minWidth: 320, boxShadow: '0 4px 24px #0002', textAlign: 'center' }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Add Action</h4>
            <div style={{ marginBottom: 12 }}>
              <select value={selectedExisting} onChange={e => setSelectedExisting(e.target.value)} style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15, marginBottom: 8 }}>
                <option value="">Select existing action...</option>
                {actions.map((a: Action) => <option key={a.id} value={a.id}>{a.id}</option>)}
              </select>
              <div style={{ fontSize: 13, color: '#64748b', margin: '6px 0' }}>or add a new action ID</div>
              <input value={newActionId} onChange={e => setNewActionId(e.target.value)} placeholder="New action ID" style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 15 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSaveNewAction} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 