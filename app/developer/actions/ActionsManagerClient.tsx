'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Action } from '@/app/types';
import { useSearchParams } from 'next/navigation';
import ActionModal from '@/components/Dev/ActionModal';

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

export default function ActionsManagerClient() {
  const actionsObj = useGameStore((state) => state.actions);
  const setActions = useGameStore((state) => state.setActions);
  const actions: Action[] = actionsObj ? Object.values(actionsObj) : [];
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';

  // Find missing actions referenced by scenes (choices[].nextAction and scene.actions[])
  const scenesObj = useGameStore((state) => state.scenes);
  const scenes = scenesObj ? Object.values(scenesObj) : [];
  const existingActionIds = new Set(actions.map(a => a.id));
  const referencedActionIds = new Set<string>();
  scenes.forEach(scene => {
    // From scene.actions[]
    (scene.actions || []).forEach(actionId => {
      if (actionId && !existingActionIds.has(actionId)) {
        referencedActionIds.add(actionId);
      }
    });
    // From choices[].nextAction
    (scene.choices || []).forEach(choice => {
      if (choice.nextAction && !existingActionIds.has(choice.nextAction)) {
        referencedActionIds.add(choice.nextAction);
      }
    });
  });
  const missingActionIds = Array.from(referencedActionIds).filter(id => !existingActionIds.has(id));

  useEffect(() => {
    async function fetchActions() {
      const res = await fetch(`/api/games/${game}/`);
      const { actions } = await res.json();
      setActions(actions);
    }
    if (!actionsObj) fetchActions();
  }, [game, actionsObj, setActions]);

  function openAddModal() {
    setEditIndex(null);
    setShowModal(true);
  }
  function openEditModal(idx: number) {
    if (!actions) return;
    setEditIndex(idx);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditIndex(null);
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

  // Handler to add a missing action
  function handleAddMissingAction() {
    setEditIndex(null);
    setShowModal(true);
  }

  if (!actionsObj) {
    return <div className="mt-12 text-center text-slate-500 text-[20px]">Loading actions...</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900 p-8">
      <div className="max-w-[700px] mx-auto">
        <h2 className="text-[32px] font-bold mb-2">Actions Manager</h2>
        <div className="flex gap-4 mb-4">
          <Link href="/developer" className="text-blue-600 underline font-medium">&larr; Back to Dashboard</Link>
          <Link href="/developer/scenes" className="text-blue-600 underline font-medium ml-4">Go to Scene Manager</Link>
        </div>
        <ul className="mt-4 p-0 list-none w-full">
          {actions.map((action, idx) => (
            <li key={action.id} className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm px-3 py-2 rounded-lg mb-2 text-[15px] w-full min-w-0">
              <div className="flex-[2] font-bold text-orange-700 text-[16px] truncate">{action.id}</div>
              <div className="flex-1 text-slate-500 text-[14px] truncate">({action.trigger})</div>
              <div className="flex-[4] text-slate-700 text-[14px] truncate">{action.failMessage?.slice(0, 60) || '...'}</div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="bg-blue-600 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-blue-700 transition" onClick={() => openEditModal(idx)}>Edit</button>
                <button className="bg-red-500 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-red-600 transition" onClick={() => confirmDelete(idx)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
        {/* Missing Actions Section */}
        {missingActionIds.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-lg p-5">
            <h4 className="text-[18px] font-bold text-orange-700 mb-2">Missing Actions</h4>
            <ul className="list-none p-0 m-0">
              {missingActionIds.map(id => (
                <li key={id} className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-yellow-700 text-[16px]">{id}</span>
                  <button type="button" onClick={handleAddMissingAction} className="bg-green-500 text-white rounded-lg px-4 py-1 font-semibold text-[15px] hover:bg-green-600 transition">Add Action</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="mt-8 bg-green-500 text-white rounded-lg px-7 py-3 font-bold text-[18px] cursor-pointer shadow-md hover:bg-green-600 transition" onClick={openAddModal}>+ Add Action</button>
      </div>
      {/* Modal for Add/Edit */}
      {showModal && (
        <ActionModal
          action={editIndex === null ? defaultAction : actions[editIndex]}
          isEditing={editIndex !== null}
          onSave={async (updatedAction) => {
            const updatedActions = { ...actionsObj, [updatedAction.id]: updatedAction };
            setActions(updatedActions);
            await saveActionToDisk(updatedAction, game);
          }}
          onClose={closeModal}
          actions={actions}
          scenes={scenes}
        />
      )}
      {/* Delete Confirmation */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-xl p-8 min-w-[320px] shadow-2xl text-center">
            <h3 className="text-[22px] font-bold mb-4">Delete Action?</h3>
            <p className="text-slate-700 mb-6">Are you sure you want to delete <strong>{actions[deleteIndex]?.id}</strong>?</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDelete} className="bg-slate-500 text-white rounded-lg px-5 py-2 font-semibold cursor-pointer">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white rounded-lg px-5 py-2 font-semibold cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 