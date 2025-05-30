// components/SceneForm.tsx
import React, { useState, useEffect } from 'react';
import { Scene, Action } from '@/app/types';
import ActionModal from '@/components/Dev/ActionModal';

// SceneActionsBox logic extracted for reuse
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

function SceneActionsBox({ form, setForm, actionsObj, onEditAction, onUpdateActionOutcome }: SceneActionsBoxProps) {
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

// Main SceneForm component
interface SceneFormProps {
  scene: Scene;
  actionsObj: Record<string, Action> | null;
  allScenes: Scene[];
  onSave: (scene: Scene) => void;
  onCancel?: () => void;
  setActionsObj?: (actions: Record<string, Action>) => void;
}

export default function SceneForm({ scene, actionsObj, allScenes, onSave, onCancel, setActionsObj }: SceneFormProps) {
  const [form, setForm] = useState<Scene>(scene);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  useEffect(() => {
    setForm(scene);
  }, [scene]);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
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
  function handleOpenActionModal(actionId: string) {
    setEditingActionId(actionId);
    setShowActionModal(true);
  }
  function handleCloseActionModal() {
    setShowActionModal(false);
    setEditingActionId(null);
  }
  function handleUpdateActionOutcome(actionId: string, outcome: string) {
    if (!actionsObj || !setActionsObj) return;
    const updatedActions = { ...actionsObj };
    if (updatedActions[actionId]) {
      const action = updatedActions[actionId];
      const newOutcomes = Array.isArray(action.outcomes) && action.outcomes.length > 0
        ? [{ ...action.outcomes[0], description: outcome }, ...action.outcomes.slice(1)]
        : [{ description: outcome, stateChanges: [] }];
      updatedActions[actionId] = { ...action, outcomes: newOutcomes };
      setActionsObj(updatedActions);
    }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <h3 className="text-[22px] font-bold mb-1.5">Edit Scene</h3>
      {/* Basic Description section */}
      <div className="bg-cyan-50 border border-slate-200 rounded-lg p-3 mb-4 w-full">
        <div className="flex gap-2.5">
          <div className="basis-1/5 flex flex-col gap-0.5 justify-stretch">
            <div className="font-semibold text-[15px] mb-0.5">Basic Information</div>
            {/* ID */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <label className="font-semibold text-[13px] min-w-[70px]">ID</label>
              <input name="id" value={form.id} onChange={handleFormChange} required className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" disabled />
            </div>
            {/* Location */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <label className="font-semibold text-[13px] min-w-[70px]">Location</label>
              <input name="location" value={form.location} onChange={handleFormChange} required className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" />
            </div>
            {/* Season */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <label className="font-semibold text-[13px] min-w-[70px]">Season</label>
              <input name="season" value={form.season} onChange={handleFormChange} className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" />
            </div>
            {/* Parent Scene */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <label className="font-semibold text-[13px] min-w-[70px]">Parent</label>
              <select name="parentSceneId" value={form.parentSceneId || ''} onChange={handleFormChange} className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]">
                <option value="">None</option>
                {allScenes.filter(s => s.id !== form.id).map(s => (
                  <option key={s.id} value={s.id}>{s.id}</option>
                ))}
              </select>
            </div>
            {/* Required? */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <label className="font-semibold text-[13px] min-w-[70px]">Required?</label>
              <input type="checkbox" name="isRequired" checked={form.isRequired} onChange={handleFormChange} className="ml-0" />
            </div>
          </div>
          <div className="basis-4/5 flex flex-col justify-stretch">
            <label className="font-semibold text-[14px] mb-0.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleFormChange} required className="w-full px-1 py-0.5 rounded border border-slate-300 text-[14px] min-h-[112px] h-[112px] mt-0 resize-vertical" />
          </div>
        </div>
      </div>
      {/* Actions section */}
      <SceneActionsBox
        form={form}
        setForm={setForm}
        actionsObj={actionsObj}
        onEditAction={handleOpenActionModal}
        onUpdateActionOutcome={handleUpdateActionOutcome}
      />
      {/* Choices section */}
      <div className="bg-purple-50 border border-slate-200 rounded-lg p-3 w-full">
        <div className="flex items-center gap-1.5 mb-2">
          <label className="font-semibold text-[16px]">Choices</label>
          <button type="button" onClick={addChoice} className="bg-blue-600 text-white border-none rounded-full w-7 h-7 flex items-center justify-center font-bold text-[18px] cursor-pointer ml-0.5">+</button>
        </div>
        {/* Headers for choices */}
        <div className="flex gap-2 font-semibold text-[14px] mb-0.5">
          <div className="basis-4/5">Text</div>
          <div className="basis-1/5">Next Node ID</div>
        </div>
        {form.choices.map((choice, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-1">
            <input placeholder="Text" value={choice.text} onChange={e => handleChoiceChange(idx, 'text', e.target.value)} required className="basis-4/5 min-w-[80px] px-1 py-0.5 rounded border border-slate-300 text-[14px] bg-white" />
            <input placeholder="Next Node ID" value={choice.nextNodeId} onChange={e => handleChoiceChange(idx, 'nextNodeId', e.target.value)} required className="basis-1/5 min-w-[60px] px-1 py-0.5 rounded border border-slate-300 text-[14px] bg-white" />
            {form.choices.length > 1 && (
              <button type="button" onClick={() => removeChoice(idx)} className="bg-red-500 text-white border-none rounded px-2 font-semibold cursor-pointer text-[13px] ml-0.5">Remove</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1" /> {/* Spacer to push buttons to bottom */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-3 pb-2 z-2">
        {onCancel && <button type="button" onClick={onCancel} className="bg-slate-500 text-white border-none rounded-lg px-5 py-2 font-semibold cursor-pointer">Cancel</button>}
        <button type="submit" className="bg-green-500 text-white border-none rounded-lg px-5 py-2 font-semibold cursor-pointer">Save</button>
      </div>
      {/* Render the Actions modal as a modal-on-modal if showActionModal is true */}
      {showActionModal && editingActionId && actionsObj && actionsObj[editingActionId] && (
        <ActionModal
          action={actionsObj[editingActionId]}
          isEditing={true}
          onSave={async (updatedAction) => {
            if (!setActionsObj || !actionsObj) return;
            const updatedActions = { ...actionsObj, [updatedAction.id]: updatedAction };
            setActionsObj(updatedActions);
          }}
          onClose={handleCloseActionModal}
          actions={Object.values(actionsObj)}
          scenes={allScenes}
        />
      )}
    </form>
  );
}