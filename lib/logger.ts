import { Action, Outcome } from "@/app/types";
import { LogEntry, useLogStore } from '@/store/logStore';

export function logEvent(kind: LogEntry["kind"], data: Partial<LogEntry>) {
  useLogStore.getState().push({ t: Date.now(), kind, ...data });
}

export function logAction(action: Action) {
  logEvent("action", action);
}

export function logOutcome(outcome: Outcome) {
  logEvent("outcome", outcome);
}