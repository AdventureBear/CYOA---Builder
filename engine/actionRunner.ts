// actionRunner.ts
import { Trigger, Action, GameState } from "@/app/types";
import { passesConditions } from "./passesConditions";
import { useGameStore } from "@/store/gameStore";
import { applyChanges } from "./applyChanges";
import { ModalChoice, useModalStore } from "@/store/modalStore";

export function runActions(
  ids: string[],
  trigger: Trigger,
  stateSnapshot: GameState,
  actions: Record<string, Action>
) {
  console.log("runActions ids:", ids, "actions keys:", actions && Object.keys(actions));
  console.log("actions keys:", actions && Object.keys(actions));
  console.log("ids:", ids);

  ids.forEach((id) => {
    console.log("Trying to access actions[id]:", id, actions && actions[id]);

    const action: Action | undefined = actions[id];
    /* ---------- missing id ---------- */
    if (!action) {
      console.log("⛔ unknown action id – skipped\n");
      return;
    }
  
    console.log(`\nChecking ${id} with ${trigger} trigger`)
    
  
  
    /* ---------- trigger mismatch ---------- */
    if (action.trigger !== trigger) {
      console.log(`\n↪︎ skipped:  ${trigger} does not match ${action.trigger}\n`);
      return;
    }

    /* ---------- conditions ---------- */
    console.log("Checking action:", action);
    const { passed, reports } = passesConditions(
      action.conditions,
      stateSnapshot
    );

  reports.forEach((report, idx) => {
  const condType = action.conditions?.[idx]?.type ?? "no condition";
  console.log(`${action.id} ${condType} cond[${idx}] → ${report.pass ? "PASS" : "FAIL"} • ${report.msg}`);
});
    /* ---------- final verdict ---------- */
    if (!passed) {
      console.log(`✖ RESULT: conditions failed – ${action.id} NOT run\n`);
      // Show a modal alert for failed condition
      setTimeout(() => {
        useModalStore.getState().push({
          id: `${id}/fail` + Math.random(),
          description: action.failMessage ?? "You can't do that right now.",

        });
      }, 0);
      return;
    }

    console.log(`✔ RESULT: conditions passed – ${action.id} WILL run\n`);



    /* ---- Step 4 logic (stateChanges) will go here ---- */
    const outcome = action.outcomes[0];     // step‑4: use first outcome only
    
    if (outcome) {
      // Queue the modal update for the next tick
      setTimeout(() => {
        const md = {
          id: `${id}/0`,
          description: outcome.description ?? '',
          choices: outcome.choices as ModalChoice[],   // optional
        };
        
        useModalStore.getState().push(md);

   // Always apply outcome-level state changes
if (outcome.stateChanges?.length) {
  const prev = useGameStore.getState().gameState;
  const next = applyChanges(prev, outcome.stateChanges);
  useGameStore.getState().setGameState(next);
  console.log("📦 stateChanges applied:", outcome.stateChanges);
}
      }, 0);
    } 
  });
}

// New function to handle choice selection
export function handleModalChoice(choice: ModalChoice) {
  // 1. Apply stateChanges if present
    if ('stateChanges' in choice && Array.isArray(choice.stateChanges)) {
    const prev = useGameStore.getState().gameState;
    const next = applyChanges(prev, choice.stateChanges);
    useGameStore.getState().setGameState(next);
    console.log("📦 stateChanges from choice applied:", choice.stateChanges);
  }
  // 2. Run nextAction if present
  const actions = useGameStore.getState().actions;
  if (choice.nextAction && actions) {
    runActions([choice.nextAction], 'onChoice', useGameStore.getState().gameState, actions);
  }
  // 3. Remove the current modal
  useModalStore.getState().pop();
}