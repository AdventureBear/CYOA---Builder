import { Condition } from "@/app/types";
import { GameState } from "@/app/types";

export interface ConditionReport {
    pass: boolean;      // did THIS condition pass?
    msg: string;        // human‑readable log line
  }
  
  export interface ConditionsResult {
    passed: boolean;          // all conditions passed?
    reports: ConditionReport[]; // one entry per condition
  }

  function checkHasItem(cond: Condition, state: GameState): boolean {
    const have = state.inventory[cond.key!] ?? 0;
    const need = Number(cond.value ?? 1);
    const cmp  = cond.comparator ?? "gte";
    return cmp === "eq" ? have === need : have >= need;
  }
  
  export function passesConditions(
    conds: Condition[] | undefined,
    state: GameState
  ): ConditionsResult {
    if (!conds || conds.length === 0)
      return { passed: true, reports: [{ pass: true, msg: "always passes" }] };
  
    const reports = conds.map<ConditionReport>((choice) => {
      switch (choice.type) {
        case "hasItem": {
            const pass = checkHasItem(choice, state);
            return {
              pass,
              msg: `👜 hasItem • ${choice.key}=${state.inventory[choice.key!] ?? 0} / need ${choice.value ?? 1} (${pass ? "PASS" : "FAIL"})`,
            };
          }
        case "random": {
          const chance = choice.chance ?? 1;
          const roll   = Math.random();
          const pass   = roll < chance;
          return {
            pass,
            msg: `🎲 random • roll=${roll.toFixed(2)}  chance=${chance}  → ${
              pass ? "PASS" : "FAIL"
            }`,
          };
        }
  
        default:
          return {
            pass: true,
            msg: `ℹ︎ unsupported type '${choice.type}' → PASS`,
          };
      }
    });
  
    const passed = reports.every((r) => r.pass);
    return { passed, reports };
  }