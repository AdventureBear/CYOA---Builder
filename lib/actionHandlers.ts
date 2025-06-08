import { Action } from "@/app/types";

// Save an action and update the store
export async function saveActionAndUpdateStore({
  form,
  actionsObj,
  setActions,
  game,
}: {
  form: Action;
  actionsObj: Record<string, Action> | null;
  setActions: (actions: Record<string, Action>) => void;
  game: string;
}) {
  const updatedActions: Record<string, Action> = actionsObj ? { ...actionsObj } : {};
  updatedActions[form.id] = form;
  
  // Update the store first
  setActions(updatedActions);

  try {
    // Save to backend
    const res = await fetch('/api/saveAction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: form, game }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save action');
    }
  } catch (error) {
    // If the API call fails, revert the state
    if (actionsObj) {
      setActions(actionsObj);
    }
    throw error;
  }
}

export async function deleteActionAndUpdateStore({
  actionId,
  gameId,
  actions,
  setActions,
}: {
  actionId: string;
  gameId: string;
  actions: Record<string, Action>;
  setActions: (actions: Record<string, Action>) => void;
}) {
  const updatedActions = { ...actions };
  delete updatedActions[actionId];
  
  // Update the store first
  setActions(updatedActions);

  try {
    const res = await fetch('/api/deleteAction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, gameId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete action');
    }
  } catch (error) {
    // If the API call fails, revert the state
    setActions(actions);
    throw error;
  }
} 