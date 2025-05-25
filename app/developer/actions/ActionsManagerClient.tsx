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
    return <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading actions...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Actions Manager</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        <Link href="/developer/scenes" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500, marginLeft: 16 }}>Go to Scene Manager</Link>
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
        {/* Missing Actions Section */}
        {missingActionIds.length > 0 && (
          <div style={{ marginTop: 32, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: 20 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#b35c1e', marginBottom: 8 }}>Missing Actions</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {missingActionIds.map(id => (
                <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: '#d97706', fontSize: 16 }}>{id}</span>
                  <button type="button" onClick={handleAddMissingAction} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Add Action</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button style={{ marginTop: 32, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }} onClick={openAddModal}>+ Add Action</button>
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
        />
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