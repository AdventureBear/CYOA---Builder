import { Action, Outcome } from "@/app/types";
import { useLogStore } from "@/store/logStore"; // new zustand slice

export function logEvent(kind: "action" | "outcome", data: any) {
  useLogStore.getState().push({ t: Date.now(), kind, ...data });
}

export function logAction(action: Action) {
  logEvent("action", action);
}

export function logOutcome(outcome: Outcome) {
  logEvent("outcome", outcome);
}