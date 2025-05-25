'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import type { Scene, Action } from '@/app/types';
import ActionModal from '@/components/Dev/ActionModal';

const defaultScene = {
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

// More colorful pastel backgrounds
const pastelBasic = '#e6f7fa'; // blue-cyan
const pastelActions = '#f9f6e7'; // yellow
const pastelChoices = '#f6e7fa'; // purple

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
    <div style={{ background: pastelActions, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' }}>
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
          <button type="button" onClick={handleAddAction} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>+</button>
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

export default function SceneManager() {
  const searchParams = useSearchParams();
  const scenesObj = useGameStore((state) => state.scenes);
  const setScenes = useGameStore((state) => state.setScenes);
  const actionsObj = useGameStore((state) => state.actions);
  const setActions = useGameStore((state) => state.setActions);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Scene>(defaultScene);
  
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const game = searchParams?.get('game') || 'cute-animals';

  const scenes: Scene[] = scenesObj ? Object.values(scenesObj) : [];

  // State for modal-on-modal action editing
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Find missing scenes referenced by choices[].nextNodeId
  const existingSceneIds = new Set(scenes.map(s => s.id));
  const referencedSceneIds = new Set<string>();
  scenes.forEach(scene => {
    scene.choices.forEach(choice => {
      if (choice.nextNodeId && !existingSceneIds.has(choice.nextNodeId)) {
        referencedSceneIds.add(choice.nextNodeId);
      }
    });
  });
  const missingSceneIds = Array.from(referencedSceneIds).filter(id => !existingSceneIds.has(id));

  // Handler to add a missing scene
  function handleAddMissingScene(id: string) {
    setForm({ ...defaultScene, id });
    setEditIndex(null);
    setShowModal(true);
  }

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
    try {
      if (!sceneToSave) throw new Error('No scene to save');
      await saveSceneToDisk(sceneToSave, game);
      closeModal();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save scene');
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

  // Open the Actions modal from the Scene editor
  const handleOpenActionModal = (actionId: string) => {
    setEditingActionId(actionId);
    setShowActionModal(true);
  };
  // Close the Actions modal
  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setEditingActionId(null);
  };

  useEffect(() => {
    async function fetchScenesAndActions() {
      const res = await fetch(`/api/games/${game}/`);
      const { scenes, actions } = await res.json();
      setScenes(scenes);
      setActions(actions);
    }
    if (!scenesObj || !actionsObj) fetchScenesAndActions();
  }, [game, scenesObj, actionsObj, setScenes, setActions]);

  if (!scenesObj) {
    return <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading scenes...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Scene Manager</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        <Link href="/developer/actions" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500, marginLeft: 16 }}>Go to Actions Manager</Link>
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
        {/* Missing Scenes Section */}
        {missingSceneIds.length > 0 && (
          <div style={{ marginTop: 32, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 20 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#b35c1e', marginBottom: 8 }}>Missing Scenes</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {missingSceneIds.map(id => (
                <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: '#d97706', fontSize: 16 }}>{id}</span>
                  <button type="button" onClick={() => handleAddMissingScene(id)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Add Scene</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Scene</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (!form ? null : (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: 24, minWidth: 600, boxShadow: '0 4px 24px #0002', maxWidth: 1080, width: '90%', minHeight: '90vh', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{editIndex === null ? 'Add Scene' : 'Edit Scene'}</h3>
            {/* Basic Description section with more colorful pastel */}
            <div style={{ background: pastelBasic, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'stretch' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Basic Information</div>
                  {/* ID */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <label style={{ fontWeight: 600, fontSize: 13, minWidth: 70 }}>ID</label>
                    <input name="id" value={form.id} onChange={handleFormChange} required style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14 }} disabled={editIndex !== null} />
                  </div>
                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <label style={{ fontWeight: 600, fontSize: 13, minWidth: 70 }}>Location</label>
                    <input name="location" value={form.location} onChange={handleFormChange} required style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14 }} />
                  </div>
                  {/* Season */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <label style={{ fontWeight: 600, fontSize: 13, minWidth: 70 }}>Season</label>
                    <input name="season" value={form.season} onChange={handleFormChange} style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14 }} />
                  </div>
                  {/* Parent Scene */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <label style={{ fontWeight: 600, fontSize: 13, minWidth: 70 }}>Parent</label>
                    <select name="parentSceneId" value={form.parentSceneId || ''} onChange={handleFormChange} style={{ flex: 1, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14 }}>
                      <option value="">None</option>
                      {scenes.filter(s => s.id !== form.id).map(s => (
                        <option key={s.id} value={s.id}>{s.id}</option>
                      ))}
                    </select>
                  </div>
                  {/* Required? */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <label style={{ fontWeight: 600, fontSize: 13, minWidth: 70 }}>Required?</label>
                    <input type="checkbox" name="isRequired" checked={form.isRequired} onChange={handleFormChange} style={{ marginLeft: 0 }} />
                  </div>
                </div>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
                  <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} required style={{ width: '100%', padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 14, minHeight: 112, height: '112px', marginTop: 0, resize: 'vertical' }} />
                </div>
              </div>
            </div>
            {/* Actions section with pastel background and spreadsheet-like rows */}
            <SceneActionsBox
              form={form}
              setForm={setForm}
              actionsObj={actionsObj}
              onEditAction={handleOpenActionModal}
              onUpdateActionOutcome={(actionId: string, outcome: string) => {
                if (!actionsObj) return;
                const updatedActions = { ...actionsObj };
                if (updatedActions[actionId]) {
                  const action = updatedActions[actionId];
                  const newOutcomes = Array.isArray(action.outcomes) && action.outcomes.length > 0
                    ? [{ ...action.outcomes[0], description: outcome }, ...action.outcomes.slice(1)]
                    : [{ description: outcome, stateChanges: [] }];
                  updatedActions[actionId] = { ...action, outcomes: newOutcomes };
                  setActions(updatedActions);
                  // Optionally, persist to disk here
                }
              }}
            />
            {/* Choices section with more colorful pastel */}
            <div style={{ background: pastelChoices, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 0, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 16 }}>Choices</label>
                <button type="button" onClick={addChoice} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 2 }}>+</button>
              </div>
              {/* Headers for choices */}
              <div style={{ display: 'flex', gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                <div style={{ flex: 2 }}>Text</div>
                <div style={{ flex: 1 }}>Next Node ID</div>
              </div>
              {form.choices.map((choice, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <input placeholder="Text" value={choice.text} onChange={e => handleChoiceChange(idx, 'text', e.target.value)} required style={{ flex: 2, minWidth: 80, padding: '2px 4px', borderRadius: 2, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }} />
                  <input placeholder="Next Node ID" value={choice.nextNodeId} onChange={e => handleChoiceChange(idx, 'nextNodeId', e.target.value)} required style={{ flex: 1, minWidth: 60, padding: '2px 4px', borderRadius: 2, border: '1px solid #cbd5e1', fontSize: 14, background: '#fff' }} />
                  {form.choices.length > 1 && (
                    <button type="button" onClick={() => removeChoice(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 2, padding: '2px 8px', fontWeight: 600, cursor: 'pointer', fontSize: 13, marginLeft: 2 }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }} /> {/* Spacer to push buttons to bottom */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, background: '#fff', paddingTop: 12, paddingBottom: 8, zIndex: 2 }}>
              <button type="button" onClick={closeModal} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>{editIndex === null ? 'Add' : 'Save'}</button>
            </div>
          </form>
        </div>
      ))}
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
      {/* Render the Actions modal as a modal-on-modal if showActionModal is true */}
      {showActionModal && editingActionId && actionsObj && actionsObj[editingActionId] && (
        <ActionModal
          action={actionsObj[editingActionId]}
          isEditing={true}
          onSave={async (updatedAction) => {
            const updatedActions = { ...actionsObj, [updatedAction.id]: updatedAction };
            setActions(updatedActions);
            // Optionally, persist to disk here
          }}
          onClose={handleCloseActionModal}
        />
      )}
    </div>
  );
} 