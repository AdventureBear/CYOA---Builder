'use client';
import Link from 'next/link';
import { useEffect, useState , useMemo} from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import type { Scene, Action } from '@/app/types';
import ActionModal from '@/components/Dev/ActionModal';
import { useLoadScenesAndActions } from '@/lib/useLoadScenesAndActions';
import { saveSceneAndUpdateStore } from '@/lib/sceneHandlers';
import React from 'react';
import { SceneListing } from '@/components/Dev/SceneManager/SceneListing';
import { SceneActionsBox } from '@/components/Dev/SceneManager/SceneActionsBox';
import { findReachableScenes, getSceneCategories } from '@/lib/sceneUtils';

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


// Scene categorization helpers (exported for reuse)
// export function findReachableScenes(scenes: Scene[], entryId: string): Set<string> { ... }
// export function getSceneCategories(scenes: Scene[], actionsObj: Record<string, Action> | null, entryId: string) { ... }


export default function SceneManagerClient() {
  useLoadScenesAndActions();
  const searchParams = useSearchParams();
  const scenesObj = useGameStore((state) => state.scenes);
  const setScenes = useGameStore((state) => state.setScenes);
  const actionsObj = useGameStore((state) => state.actions);
  const setActions = useGameStore((state) => state.setActions);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Scene>(defaultScene);
  const [deleteIndex, setDeleteIndex] = useState<string | null>(null);
  const game = searchParams?.get('game') || 'cute-animals';
  // State for modal-on-modal action editing
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // All scene IDs in the store, memoized to avoid re-rendering when scenesObj changes
  const scenes: Scene[] = useMemo(() => scenesObj ? Object.values(scenesObj) : [], [scenesObj]);

  // Find disconnected scenes (always call these hooks at the top level)
  const entryId = 'forest_clearing';
  const reachable = useMemo(() => findReachableScenes(scenes, entryId), [scenes]);
  const disconnectedScenes = useMemo(() => scenes.filter(s => !reachable.has(s.id)), [scenes, reachable]);

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
  function openEditModal(id: string) {
    const scene = scenes.find(s => s.id === id);
    if (!scene) return;
    setForm(scene);
    setEditIndex(scenes.findIndex(s => s.id === id));
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
    try {
      await saveSceneAndUpdateStore({
        form,
        editIndex,
        scenes,
        scenesObj,
        setScenes,
        game,
      });
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save scene');
    }
  }
  function confirmDelete(id: string) {
    setDeleteIndex(id);
  }
  async function handleDelete() {
    if (deleteIndex !== null && scenesObj && scenesObj[deleteIndex]) {
      const updatedScenes = { ...scenesObj };
      delete updatedScenes[deleteIndex];
      setScenes(updatedScenes); setDeleteIndex(null);
      // Call backend to delete scene
      try {
        const res = await fetch('/api/deleteScene', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deleteIndex, game }),
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
        {/* Disconnected Scenes Section */}
        {disconnectedScenes.length > 0 && (
          <div className="mt-8">
            <h4 className="text-[18px] font-bold text-blue-700 mb-1">Disconnected Scenes</h4>
            <SceneListing
              scenes={disconnectedScenes}
              type="disconnected"
              onEdit={openEditModal}
              onDelete={confirmDelete}
            />
          </div>
        )}
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
            <p className="text-slate-700 mb-6">Are you sure you want to delete <strong>{deleteIndex}</strong>?</p>
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