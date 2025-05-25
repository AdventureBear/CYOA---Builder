import { GameState, StateChange } from "@/app/types";

/** returns a *new* GameState with the changes applied */
export function applyChanges(
  state: GameState,
  changes: StateChange[]
): GameState {
  // shallow‑copy top level first
  const next: GameState = {
    ...state,
    inventory: { ...state.inventory },
    flags: { ...state.flags },
  };

  changes.forEach((change) => {
    console.log('Applying state change:', change);
    switch (change.type) {
      case "addItem": {
        const qty = change.amount ?? 1;
        next.inventory[change.key] = (next.inventory[change.key] ?? 0) + qty;
        console.log('Added item:', change.key, 'qty:', qty, 'next:', next.inventory[change.key]);
        break;
      }
      case "removeItem": {
        const qty = change.amount ?? 1;
        const current = next.inventory[change.key] ?? 0;
        next.inventory[change.key] = Math.max(0, current - qty);
        console.log('Removed item:', change.key, 'qty:', qty, 'current:', current, 'next:', next.inventory[change.key]);
        break;
      }
      case "setFlag": {
        next.flags[change.key] = true;
        console.log('Set flag:', change.key, 'next:', next.flags[change.key]);
        break;
      }
    }
  });

  return next;
}
