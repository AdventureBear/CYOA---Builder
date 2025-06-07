import { Action, Scene, Condition } from '@/app/types';

export function analyzeActionUsage(actions: Action[], scenes: Scene[]) {
    if (!actions || actions.length === 0) {
        return {
            actionToScenes: new Map<string, string[]>(),
            unusedActionIds: (actions || []).map(a => a.id)
        };
    }

    // Maps child action ID to its direct parent action IDs
    const actionParentGraph = new Map<string, Set<string>>();
    for (const action of actions) {
        if (!action.outcomes) continue;
        for (const outcome of action.outcomes) {
            if (!outcome.choices) continue;
            for (const choice of outcome.choices) {
                if (choice.nextAction) {
                    if (!actionParentGraph.has(choice.nextAction)) {
                        actionParentGraph.set(choice.nextAction, new Set());
                    }
                    actionParentGraph.get(choice.nextAction)!.add(action.id);
                }
            }
        }
    }

    // Maps action ID to scene IDs that directly use it
    const sceneParentGraph = new Map<string, Set<string>>();
    for (const scene of scenes) {
        const directActions = new Set<string>();
        (scene.actions || []).forEach(a => directActions.add(a));
        (scene.choices || []).forEach(c => {
            if(c.nextAction) directActions.add(c.nextAction);
        });
        
        for (const actionId of Array.from(directActions)) {
            if (!sceneParentGraph.has(actionId)) {
                sceneParentGraph.set(actionId, new Set());
            }
            sceneParentGraph.get(actionId)!.add(scene.id);
        }
    }

    const actionToScenes = new Map<string, string[]>();
    const allActionIds = actions.map(a => a.id);

    // For each action, find all its ultimate scene parents by traversing up the parent graph
    for (const actionId of allActionIds) {
        const scenesForAction = new Set<string>();
        const queue = [actionId];
        const visited = new Set([actionId]);

        while (queue.length > 0) {
            const currentActionId = queue.shift()!;

            // Add direct scenes of current action
            if (sceneParentGraph.has(currentActionId)) {
                sceneParentGraph.get(currentActionId)!.forEach(sceneId => {
                    scenesForAction.add(sceneId);
                });
            }

            // Add parent actions to queue to check them next
            if (actionParentGraph.has(currentActionId)) {
                actionParentGraph.get(currentActionId)!.forEach(parentId => {
                    if (!visited.has(parentId)) {
                        visited.add(parentId);
                        queue.push(parentId);
                    }
                });
            }
        }

        if (scenesForAction.size > 0) {
            actionToScenes.set(actionId, Array.from(scenesForAction));
        }
    }

    const unusedActionIds = allActionIds.filter(id => !actionToScenes.has(id));

    return { actionToScenes, unusedActionIds };
}

export function formatCondition(condition: Condition): string {
  switch (condition.type) {
    case 'hasItem':
      return `Has item "${condition.key}"`;
    case 'doesNotHaveItem':
      return `Does NOT have item "${condition.key}"`;
    case 'flagSet':
      return `Has flag "${condition.key}"`;
    case 'flagNotSet':
      return `Does NOT have flag "${condition.key}"`;
    case 'random':
      return `Random chance: ${(condition.chance ?? 0) * 100}%`;
    case 'reputation':
      const comp = condition.comparator || 'eq';
      const compStr = { gte: '>=', eq: '==', lte: '<=', neq: '!=' }[comp];
      return `Reputation for "${condition.key}" ${compStr} ${condition.value}`;
    case 'seasonIs':
      return `Season is "${condition.value}"`;
    case 'timeOfDayIs':
      return `Time of day is "${condition.value}"`;
    default:
      return 'Unknown condition';
  }
} 