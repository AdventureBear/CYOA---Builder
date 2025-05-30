'use client';
import Link from 'next/link';
import { useEffect, useState , useMemo} from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import type { Scene, Action } from '@/app/types';
import ActionModal from '@/components/Dev/ActionModal';
import DeveloperNav from '@/components/Dev/DeveloperNav';

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
    // <h1>Scene Actions</h1>
  );
}

// SceneListing component
function SceneListing({ scenes, type, onEdit, onDelete, onAdd }: {
  scenes: Scene[] | string[];
  type: 'active' | 'orphaned' | 'missing';
  onEdit?: (idx: number) => void;
  onDelete?: (idx: number) => void;
  onAdd?: (id: string) => void;
}) {
  // Determine border and header color based on type
  const borderColor = type === 'active' ? 'border-green-500' : type === 'missing' ? 'border-yellow-300' : 'border-red-300';
  const headerBg = type === 'active' ? 'bg-green-50' : type === 'missing' ? 'bg-yellow-50' : 'bg-red-50';
  const headerText = 'text-slate-900';
  return (
    <div className={`border ${borderColor} rounded-lg mb-0 overflow-hidden bg-white`}>
      {scenes.length > 0 && (
        <div className={`flex items-center gap-4 ${headerBg} font-bold text-[15px] ${headerText} px-3 py-2 border-b border-slate-200`}>
          <div className="flex-[1.2]">Location</div>
          <div className="flex-1">ID</div>
          <div className="flex-[4]">Description</div>
          <div className="flex flex-1 justify-end gap-2">Actions</div>
        </div>
      )}
      <ul className="list-none p-0 m-0 bg-white">
        {scenes.map((scene, idx) => {
          const id = typeof scene === 'string' ? scene : scene.id;
          const location = typeof scene === 'string' ? undefined : scene.location;
          const description = typeof scene === 'string' ? undefined : scene.description;
          const isLast = idx === scenes.length - 1;
          return (
            <li
              key={id}
              className={`flex items-center gap-4 bg-white border-b border-slate-200 shadow-sm px-3 py-2 text-[15px] w-full min-w-0 ${isLast ? 'rounded-b-lg' : ''} ${
                (type === 'active' || type === 'missing') ? 'cursor-pointer transition hover:bg-slate-100' : ''
              }`}
              onClick={
                (type === 'active' && onEdit) ? () => onEdit(idx)
                  : (type === 'missing' && onAdd) ? () => onAdd(id)
                  : undefined
              }
              onKeyDown={
                (type === 'active' && onEdit) ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEdit(idx); }
                  : (type === 'missing' && onAdd) ? (e) => { if (e.key === 'Enter' || e.key === ' ') onAdd(id); }
                  : undefined
              }
              role={(type === 'active' || type === 'missing') ? 'button' : undefined}
              tabIndex={(type === 'active' || type === 'missing') ? 0 : undefined}
            >
              <div className="flex-[1.2] font-bold text-black truncate">{location || ''}</div>
              <div className="flex-1 text-slate-500 text-[14px] truncate">({id})</div>
              <div className="flex-[4] text-slate-700 text-[14px] truncate">{description ? description.slice(0, 60) : ''}</div>
              <div className="flex gap-2 flex-1 justify-end">
                {(type === 'active' || type === 'orphaned') && onEdit && (
                  <button
                    className="bg-blue-600 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-blue-700 transition"
                    onClick={e => { e.stopPropagation(); onEdit(idx); }}
                  >Edit</button>
                )}
                {(type === 'active' || type === 'orphaned') && onDelete && (
                  <button
                    className="bg-red-500 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-red-600 transition"
                    onClick={e => { e.stopPropagation(); onDelete(idx); }}
                  >Delete</button>
                )}
                {type === 'missing' && onAdd && (
                  <button
                    className="bg-green-500 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-green-600 transition"
                    onClick={e => { e.stopPropagation(); onAdd(id); }}
                  >Add</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function SceneManagerClient() {
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
// State for modal-on-modal action editing
const [showActionModal, setShowActionModal] = useState(false);
const [editingActionId, setEditingActionId] = useState<string | null>(null);

  
  // All scene IDs in teh store, memoized to avoid re-rendering when scenesObj changes
  const scenes: Scene[] = useMemo(() => scenesObj ? Object.values(scenesObj) : [], [scenesObj]);


  const orphanedSceneIds = useMemo(() => {
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return []
    const existingSceneIds = new Set(scenes.map((s) => s.id))
    
    // All referenced scene IDs from scene choices
  const referencedSceneIds = new Set();
  scenes.forEach(scene => {
    (scene.choices || []).forEach(choice => {
      if (choice.nextNodeId) referencedSceneIds.add(choice.nextNodeId);
    });
  });

  // 3. All referenced scene IDs from action outcomes (nextSceneOverride)
  actionsObj && Object.values(actionsObj).forEach((action: Action) => {
    (action.outcomes || []).forEach(outcome => {
      if (outcome.nextSceneOverride) referencedSceneIds.add(outcome.nextSceneOverride);
      // (Optional: outcome.choices[].nextNodeId)
      (outcome.choices || []).forEach(choice => {
        if (choice.nextNodeId) referencedSceneIds.add(choice.nextNodeId);
      });
    });
  });


  //Todo: Add referenced scene IDs from next node no choices?

  // 4. Orphaned = in allSceneIds but not in referencedSceneIds
  // (Optionally, exclude the initial scene, e.g., 'forest_clearing')
  return Array.from(existingSceneIds).filter(
    id => !referencedSceneIds.has(id) && id !== 'forest_clearing'
  );
}, [scenes, actionsObj]);

  
  const missingSceneIds = useMemo(() => {
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) return []
    const existingSceneIds = new Set(scenes.map((s) => s.id))
    const referencedSceneIds = new Set<string>()
    scenes.forEach((scene) => {
      if (scene.choices && Array.isArray(scene.choices)) {
        scene.choices.forEach((choice) => {
          if (choice.nextNodeId && !existingSceneIds.has(choice.nextNodeId)) {
            referencedSceneIds.add(choice.nextNodeId)
          }
        })
      }
    })
    return Array.from(referencedSceneIds).filter((id) => !existingSceneIds.has(id))
  }, [scenes])


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
  async function handleDelete() {
    if (deleteIndex !== null && scenesObj && scenes[deleteIndex]) {
      const updatedScenes = { ...scenesObj };
      delete updatedScenes[scenes[deleteIndex].id];
      setScenes(updatedScenes); setDeleteIndex(null);
       // Call backend to delete scene
    try {
      const res = await fetch('/api/deleteScene', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: scenes[deleteIndex].id, game }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete scene');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete scene');
    }
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
  const nonOrphanedScenes = scenes.filter(scene => !orphanedSceneIds.includes(scene.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <DeveloperNav />
      <div className="max-w-[900px] mx-auto">
        <div className="flex gap-4 mb-4">
          <Link href="/developer" className="text-blue-600 underline font-medium">&larr; Back to Dashboard</Link>
          <Link href="/developer/visualizer" className="text-blue-600 underline font-medium">Storyline Visualizer</Link>
          <Link href="/developer/actions" className="text-blue-600 underline font-medium ml-4">Go to Actions Manager</Link>
        </div>
        <h2 className="text-[32px] font-bold mb-2">Scene Manager</h2>
        <div className="mt-8">
          <h4 className="text-[18px] font-bold text-green-700 mb-1">All Scenes</h4>
          <SceneListing
            scenes={nonOrphanedScenes}
            type="active"
            onEdit={openEditModal}
            onDelete={confirmDelete}
          />
        </div>
        {/* Missing Scenes Section */}
        {missingSceneIds.length > 0 && (
          <div className="mt-8">
            <h4 className="text-[18px] font-bold text-orange-700 mb-1">Missing Scenes</h4>
            <SceneListing
              scenes={missingSceneIds}
              type="missing"
              onAdd={handleAddMissingScene}
            />
          </div>
        )}
        {/* Orphaned Scenes Section */}
        {orphanedSceneIds.length > 0 && (
          <div className="mt-8">
            <h4 className="text-[18px] font-bold text-red-600 mb-1">Orphaned Scenes</h4>
            <SceneListing
              scenes={orphanedSceneIds.map(id => scenes.find(s => s.id === id)).filter(Boolean) as Scene[]}
              type="orphaned"
              onEdit={openEditModal}
              onDelete={confirmDelete}
            />
          </div>
        )}
        <button className="mt-8 bg-green-500 text-white rounded-lg px-7 py-3 font-bold text-[18px] cursor-pointer shadow-md hover:bg-green-600 transition" onClick={openAddModal}>+ Add Scene</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (!form ? null : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 min-w-[600px] shadow-2xl max-w-[1080px] w-[90%] min-h-[90vh] max-h-[90vh] overflow-y-auto flex flex-col">
            <h3 className="text-[22px] font-bold mb-1.5">{editIndex === null ? 'Add Scene' : 'Edit Scene'}</h3>
            {/* Basic Description section with more colorful pastel */}
            <div className="bg-cyan-50 border border-slate-200 rounded-lg p-3 mb-4 w-full">
              <div className="flex gap-2.5">
                <div className="basis-1/5 flex flex-col gap-0.5 justify-stretch">
                  <div className="font-semibold text-[15px] mb-0.5">Basic Information</div>
                  {/* ID */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <label className="font-semibold text-[13px] min-w-[70px]">ID</label>
                    <input name="id" value={form.id} onChange={handleFormChange} required className="flex-1 px-1 py-0.5 rounded border border-slate-300 text-[14px]" disabled={editIndex !== null} />
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
                      {scenes.filter(s => s.id !== form.id).map(s => (
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
              <button type="button" onClick={closeModal} className="bg-slate-500 text-white border-none rounded-lg px-5 py-2 font-semibold cursor-pointer">Cancel</button>
              <button type="submit" className="bg-green-500 text-white border-none rounded-lg px-5 py-2 font-semibold cursor-pointer">{editIndex === null ? 'Add' : 'Save'}</button>
            </div>
          </form>
        </div>
      ))}


      {/* Delete Confirmation */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-xl p-8 min-w-[320px] shadow-2xl text-center">
            <h3 className="text-[22px] font-bold mb-4">Delete Scene?</h3>
            <p className="text-slate-700 mb-6">Are you sure you want to delete <strong>{scenes[deleteIndex]?.id}</strong>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDelete} className="bg-slate-500 text-white rounded-lg px-5 py-2 font-semibold cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white rounded-lg px-5 py-2 font-semibold cursor-pointer">Delete</button>
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
          actions={Object.values(actionsObj)}
          scenes={Object.values(scenesObj)}
        />
      )}

     
    </div>
  );
} 