'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Action, Scene, Condition, StateChange } from '@/app/types';
import { useSearchParams } from 'next/navigation';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import DeveloperNav from './DeveloperNav';

// Extend Choice type locally to include stateChanges for dependency search
interface ChoiceWithStateChanges {
  stateChanges?: StateChange[];
  text?: string;
}

interface OutcomeWithChoices {
  description?: string;
  choices?: ChoiceWithStateChanges[];
}

// Helper: find all actions that can set a flag or add an item
function findActionsForDependency(actions: Record<string, Action>, type: 'flag' | 'item', key: string): string[] {
  const result: string[] = [];
  for (const actionId in actions) {
    const action = actions[actionId];
    for (const outcome of action.outcomes || []) {
      // Check outcome-level stateChanges
      for (const sc of outcome.stateChanges || []) {
        if (type === 'flag' && sc.type === 'setFlag' && sc.key === key) {
          result.push(actionId);
        }
        if (type === 'item' && sc.type === 'addItem' && sc.key === key) {
          result.push(actionId);
        }
      }
      // Check choices[].stateChanges
      for (const choice of outcome.choices || []) {
        const stateChanges = (choice as ChoiceWithStateChanges).stateChanges || [];
        for (const sc of stateChanges) {
          if (type === 'flag' && sc.type === 'setFlag' && sc.key === key) {
            result.push(actionId);
          }
          if (type === 'item' && sc.type === 'addItem' && sc.key === key) {
            result.push(actionId);
          }
        }
      }
    }
  }
  return Array.from(new Set(result)); // dedupe
}

// Helper: get unmet dependencies for an action
function getDependencies(action: Action): { type: 'flag' | 'item', key: string, cond: Condition }[] {
  const deps: { type: 'flag' | 'item', key: string, cond: Condition }[] = [];
  for (const cond of action.conditions || []) {
    if (cond.type === 'flagSet') {
      deps.push({ type: 'flag', key: cond.key!, cond });
    }
    if (cond.type === 'hasItem' || cond.type === 'doesNotHaveItem') {
      deps.push({ type: 'item', key: cond.key!, cond });
    }
  }
  return deps;
}

// Helper: find all scenes that reference an action
function findScenesForAction(scenes: Record<string, Scene>, actionId: string): string[] {
  const result: string[] = [];
  for (const sceneId in scenes) {
    const scene = scenes[sceneId];
    if (scene.actions && scene.actions.includes(actionId)) {
      result.push(sceneId);
    }
  }
  return result;
}

// Tree node type
interface TreeNode {
  id: string;
  type: 'action' | 'scene' | 'dependency' | 'choice';
  label: string;
  sceneName?: string;
  actionDesc?: string;
  choiceText?: string;
  children: TreeNode[];
  dependencyFor?: string; // which flag/item this is a dependency for
}

// Helper: get the first outcome description for an action
function getActionDescription(action: Action): string {
  if (!action) return '';
  if (action.outcomes && action.outcomes.length > 0) {
    return action.outcomes[0].description || '';
  }
  return '';
}

// Helper: get scene/location name
function getSceneName(scene: Scene): string {
  return scene.location || scene.name || scene.id;
}

// Helper: find all choices that set a flag/item in an action
function findChoicesForDependency(action: Action, type: 'flag' | 'item', key: string): { choice: ChoiceWithStateChanges, outcome: OutcomeWithChoices }[] {
  const result: { choice: ChoiceWithStateChanges, outcome: OutcomeWithChoices }[] = [];
  for (const outcome of action.outcomes as OutcomeWithChoices[] || []) {
    for (const choice of outcome.choices || []) {
      const c = choice as ChoiceWithStateChanges;
      const stateChanges = c.stateChanges || [];
      for (const sc of stateChanges) {
        if (type === 'flag' && sc.type === 'setFlag' && sc.key === key) {
          result.push({ choice: c, outcome });
        }
        if (type === 'item' && sc.type === 'addItem' && sc.key === key) {
          result.push({ choice: c, outcome });
        }
      }
    }
  }
  return result;
}

// Helper: find all paths from a start scene to a target scene
function findScenePaths(
  scenes: Record<string, Scene>,
  startSceneId: string,
  targetSceneId: string,
  path: { sceneId: string; choiceText?: string }[] = [],
  visited: Set<string> = new Set()
): { sceneId: string; choiceText?: string }[][] {
  if (startSceneId === targetSceneId) {
    return [[...path, { sceneId: startSceneId }]];
  }
  if (visited.has(startSceneId)) return [];
  visited.add(startSceneId);
  const scene = scenes[startSceneId];
  if (!scene) return [];
  let paths: { sceneId: string; choiceText?: string }[][] = [];
  for (const choice of scene.choices || []) {
    if (choice.nextNodeId) {
      const subPaths = findScenePaths(
        scenes,
        choice.nextNodeId,
        targetSceneId,
        [...path, { sceneId: startSceneId, choiceText: choice.text }],
        new Set(Array.from(visited))
      );
      paths = paths.concat(subPaths);
    }
  }
  return paths;
}

// Recursively build the dependency tree for an action (narrative version)
function buildDependencyTree(
  actions: Record<string, Action>,
  scenes: Record<string, Scene>,
  actionId: string,
  visited: Set<string> = new Set(),
  dependencyFor?: string
): TreeNode {
  if (visited.has(actionId)) {
    return { id: actionId, type: 'action', label: `${actionId} (cycle)`, children: [] };
  }
  visited.add(actionId);
  const action = actions[actionId];
  if (!action) {
    return { id: actionId, type: 'action', label: `${actionId} (not found)`, children: [] };
  }
  const deps = getDependencies(action);
  const children: TreeNode[] = [];
  for (const dep of deps) {
    const depActions = findActionsForDependency(actions, dep.type, dep.key);
    if (depActions.length === 0) {
      children.push({
        id: `${dep.type}:${dep.key}`,
        type: 'dependency',
        label: `No action found to set ${dep.type}:${dep.key}`,
        children: [],
        dependencyFor: dep.key,
      });
    } else {
      for (const depActionId of depActions) {
        // For each action that can satisfy the dependency, find all scenes that reference it
        const depScenes = findScenesForAction(scenes, depActionId);
        const depAction = actions[depActionId];
        const depActionDesc = getActionDescription(depAction);
        const depSceneNodes: TreeNode[] = [];
        for (const sceneId of depScenes) {
          const scene = scenes[sceneId];
          // Find all choices in this action that set the flag/item
          const choices = findChoicesForDependency(depAction, dep.type, dep.key);
          // Find all paths from forest_clearing to this scene
          const scenePaths = findScenePaths(scenes, 'forest_clearing', sceneId);
          if (choices.length > 0) {
            for (const { choice, outcome } of choices) {
              for (const scenePath of scenePaths) {
                // Build a narrative path node for each scene path
                const pathNodes: TreeNode[] = [];
                for (let i = 0; i < scenePath.length; i++) {
                  const step = scenePath[i];
                  const sceneObj = scenes[step.sceneId];
                  pathNodes.push({
                    id: `scene:${step.sceneId}:${i}`,
                    type: 'scene',
                    label: `Scene: ${getSceneName(sceneObj)}`,
                    children: step.choiceText
                      ? [{
                          id: `choice:${step.sceneId}:${step.choiceText}`,
                          type: 'choice',
                          label: `Choice: "${step.choiceText}"`,
                          children: [],
                        }]
                      : [],
                  });
                }
                // Add the dependency action/choice at the end
                pathNodes.push({
                  id: `${sceneId}:${depActionId}:${choice.text}`,
                  type: 'choice',
                  label: `Choice: "${choice.text}" (sets ${dep.key})`,
                  sceneName: getSceneName(scene),
                  actionDesc: outcome.description || depActionDesc,
                  choiceText: choice.text,
                  children: [
                    {
                      id: sceneId,
                      type: 'scene',
                      label: `Scene: ${getSceneName(scene)}`,
                      children: [
                        {
                          id: depActionId,
                          type: 'action',
                          label: `Action: ${depActionId}${depActionDesc ? ` — ${depActionDesc}` : ''}`,
                          children: [buildDependencyTree(actions, scenes, depActionId, new Set(Array.from(visited)), dep.key)],
                          dependencyFor: dep.key,
                        },
                      ],
                    },
                  ],
                  dependencyFor: dep.key,
                });
                depSceneNodes.push({
                  id: `narrativePath:${sceneId}:${depActionId}:${choice.text}`,
                  type: 'dependency',
                  label: `Narrative path to satisfy ${dep.key}`,
                  children: pathNodes,
                  dependencyFor: dep.key,
                });
              }
            }
          } else {
            for (const scenePath of scenePaths) {
              const pathNodes: TreeNode[] = [];
              for (let i = 0; i < scenePath.length; i++) {
                const step = scenePath[i];
                const sceneObj = scenes[step.sceneId];
                pathNodes.push({
                  id: `scene:${step.sceneId}:${i}`,
                  type: 'scene',
                  label: `Scene: ${getSceneName(sceneObj)}`,
                  children: step.choiceText
                    ? [{
                        id: `choice:${step.sceneId}:${step.choiceText}`,
                        type: 'choice',
                        label: `Choice: "${step.choiceText}"`,
                        children: [],
                      }]
                    : [],
                });
              }
              pathNodes.push({
                id: depActionId,
                type: 'action',
                label: `Action: ${depActionId}${depActionDesc ? ` — ${depActionDesc}` : ''}`,
                children: [buildDependencyTree(actions, scenes, depActionId, new Set(Array.from(visited)), dep.key)],
                dependencyFor: dep.key,
              });
              depSceneNodes.push({
                id: `narrativePath:${sceneId}:${depActionId}`,
                type: 'dependency',
                label: `Narrative path to satisfy ${dep.key}`,
                children: pathNodes,
                dependencyFor: dep.key,
              });
            }
          }
        }
        // If no scene, just add the action
        if (depSceneNodes.length === 0) {
          depSceneNodes.push({
            id: depActionId,
            type: 'action',
            label: `Action: ${depActionId}${depActionDesc ? ` — ${depActionDesc}` : ''}`,
            children: [buildDependencyTree(actions, scenes, depActionId, new Set(Array.from(visited)), dep.key)],
            dependencyFor: dep.key,
          });
        }
        children.push({
          id: `${dep.type}:${dep.key}:${depActionId}`,
          type: 'dependency',
          label: `Dependency for ${dep.type}:${dep.key}`,
          children: depSceneNodes,
          dependencyFor: dep.key,
        });
      }
    }
  }
  // Find all scenes for this action (for endpoint display)
  const endpointScenes = findScenesForAction(scenes, actionId);
  let sceneLabel = '';
  if (endpointScenes.length > 0) {
    sceneLabel = ` (at ${getSceneName(scenes[endpointScenes[0]])})`;
  }
  return {
    id: actionId,
    type: dependencyFor ? 'dependency' : 'action',
    label: `Action: ${actionId}${sceneLabel}${getActionDescription(action) ? ` — ${getActionDescription(action)}` : ''}${dependencyFor ? ` (for ${dependencyFor})` : ''}`,
    children,
    dependencyFor,
  };
}

// Find all dead-end actions (actions with no outgoing nextAction/nextScene/nextNodeId)
function findDeadEndActions(actions: Record<string, Action>, graph: Record<string, string[]>) {
  return Object.keys(actions).filter(
    (actionId) => !graph[actionId] || graph[actionId].length === 0
  );
}

// Build the story graph (same as before)
function buildStoryGraph(actions: Record<string, Action>, scenes: Record<string, Scene>) {
  const graph: Record<string, string[]> = {};
  for (const sceneId in scenes) {
    const scene = scenes[sceneId];
    graph[sceneId] = [];
    if (scene.actions) {
      for (const actionId of scene.actions) {
        graph[sceneId].push(actionId);
      }
    }
    for (const choice of scene.choices || []) {
      if (choice.nextNodeId) graph[sceneId].push(choice.nextNodeId);
      if (choice.nextScene) graph[sceneId].push(choice.nextScene);
      if (choice.nextAction) graph[sceneId].push(choice.nextAction);
    }
  }
  for (const actionId in actions) {
    const action = actions[actionId];
    graph[actionId] = [];
    for (const outcome of action.outcomes || []) {
      for (const choice of outcome.choices || []) {
        if (choice.nextAction) graph[actionId].push(choice.nextAction);
        if (choice.nextScene) graph[actionId].push(choice.nextScene);
        if (choice.nextNodeId) graph[actionId].push(choice.nextNodeId);
      }
    }
  }
  return graph;
}

// Render the tree recursively (narrative version)
function renderTree(node: TreeNode, depth = 0) {
  const isDep = node.type === 'dependency';
  const isScene = node.type === 'scene';
  const isChoice = node.type === 'choice';
  return (
    <div key={node.id + depth} style={{ marginLeft: depth * 24, marginBottom: 4 }}>
      <span
        style={{
          color: isDep ? '#d97706' : isScene ? '#2563eb' : isChoice ? '#0ea5e9' : '#b35c1e',
          fontWeight: isDep ? 700 : isScene ? 600 : isChoice ? 600 : 700,
          background: isDep ? '#fef3c7' : isScene ? '#e6f7fa' : isChoice ? '#bae6fd' : 'none',
          borderRadius: isDep ? 4 : isScene ? 4 : isChoice ? 4 : 0,
          padding: isDep ? '2px 6px' : isScene ? '2px 6px' : isChoice ? '2px 6px' : 0,
          border: isDep ? '1px solid #fbbf24' : isScene ? '1px solid #a5f3fc' : isChoice ? '1px solid #38bdf8' : 'none',
        }}
        title={isDep ? 'Dependency step (required to satisfy a condition)' : isScene ? 'Scene/location' : isChoice ? 'Choice that sets flag/item' : ''}
      >
        {node.label}
      </span>
      {node.children.length > 0 && (
        <div style={{ marginTop: 2 }}>
          {node.children.map(child => renderTree(child, depth + 1))}
        </div>
      )}
    </div>
  );
}

// Helper: find all linear scene/choice/action paths from start to endpoint action
function findAllActionPaths(
  scenes: Record<string, Scene>,
  actions: Record<string, Action>,
  startSceneId: string,
  targetActionId: string,
  path: { sceneId: string; choiceText?: string; actionId?: string }[] = [],
  visitedScenes: Set<string> = new Set(),
  visitedActions: Set<string> = new Set()
): { sceneId: string; choiceText?: string; actionId?: string }[][] {
  // If the current scene contains the target action, add it as a path
  const scene = scenes[startSceneId];
  if (!scene) return [];
  let paths: { sceneId: string; choiceText?: string; actionId?: string }[][] = [];
  if (scene.actions && scene.actions.includes(targetActionId)) {
    paths.push([...path, { sceneId: startSceneId, actionId: targetActionId }]);
  }
  if (visitedScenes.has(startSceneId)) return paths;
  visitedScenes.add(startSceneId);
  for (const choice of scene.choices || []) {
    if (choice.nextNodeId && scenes[choice.nextNodeId]) {
      const subPaths = findAllActionPaths(
        scenes,
        actions,
        choice.nextNodeId,
        targetActionId,
        [...path, { sceneId: startSceneId, choiceText: choice.text }],
        new Set(Array.from(visitedScenes)),
        visitedActions
      );
      paths = paths.concat(subPaths);
    }
  }
  return paths;
}

// Helper: format a path as a one-liner string
function formatPathOneLiner(
  path: { sceneId: string; choiceText?: string; actionId?: string }[],
  scenes: Record<string, Scene>,
  actions: Record<string, Action>
) {
  const steps: string[] = [];
  for (const step of path) {
    if (step.sceneId && scenes[step.sceneId]) {
      steps.push(scenes[step.sceneId].location || scenes[step.sceneId].name || step.sceneId);
    }
    if (step.choiceText) {
      steps.push(`[${step.choiceText}]`);
    }
    if (step.actionId && actions[step.actionId]) {
      const desc = actions[step.actionId].outcomes?.[0]?.description;
      steps.push(`{${actions[step.actionId].id}${desc ? ': ' + desc : ''}}`);
    }
  }
  return steps.join(' → ');
}

// Custom node style for dependency-satisfying actions
const dependencyNodeStyle = {
  border: '2px solid #dc2626',
  background: '#fee2e2',
  color: '#991b1b',
  fontWeight: 700,
};

function CustomNode({ data }: NodeProps) {
  return (
    <div style={data.isDependency ? dependencyNodeStyle : {}} title={data.tooltip}>
      {data.label}
    </div>
  );
}

// Helper: Build a minimal dependency DAG for an endpoint action, merging branches at shared nodes
function buildDependencyGraph(
  actions: Record<string, Action>,
  scenes: Record<string, Scene>,
  endpointActionId: string
): { nodes: Node[]; edges: Edge[] } {
  let nodeId = 0;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, string>(); // key -> node.id
  // For simple grid layout
  let gridX = 0;
  const GRID_STEP_X = 220;
  const GRID_STEP_Y = 100;

  // Track which actions are dependency-satisfying for the endpoint
  const endpointDeps = new Set<string>();
  const endpointAction = actions[endpointActionId];
  if (endpointAction) {
    for (const dep of getDependencies(endpointAction)) {
      if (dep.cond.type === 'flagSet' || dep.cond.type === 'hasItem') {
        const depActions = findActionsForDependency(actions, dep.type, dep.key);
        for (const depActionId of depActions) {
          endpointDeps.add(depActionId);
        }
      }
    }
  }

  // Helper to add a node if not already present, with branchIndex for y staggering
  function addNode(key: string, label: string, type: string, data: Record<string, unknown> = {}, branchIndex = 0) {
    if (nodeMap.has(key)) return nodeMap.get(key)!;
    // Stagger y by branchIndex
    const id = `${type}-${nodeId++}`;
    const position = { x: gridX * GRID_STEP_X, y: branchIndex * GRID_STEP_Y };
    nodes.push({ id, data: { label, ...data }, position, type: data.isDependency ? 'dependency-action' : 'default' });
    nodeMap.set(key, id);
    gridX++;
    if (gridX >= 6) { gridX = 0; }
    return id;
  }

  // Add a full playable path (scenes/choices) to a target scene, return the last node id
  function addPlayablePath(path: { sceneId: string; choiceText?: string }[], branchIndex = 0): string | undefined {
    let prevNodeId: string | undefined;
    for (const step of path) {
      const sceneObj = scenes[step.sceneId];
      const sceneKey = `scene:${step.sceneId}`;
      const sceneNodeId = addNode(sceneKey, getSceneName(sceneObj), 'scene', { tooltip: sceneObj.description }, branchIndex);
      if (prevNodeId && !edges.find(e => e.source === prevNodeId && e.target === sceneNodeId)) {
        edges.push({ id: `${prevNodeId}->${sceneNodeId}`, source: prevNodeId, target: sceneNodeId });
      }
      prevNodeId = sceneNodeId;
      if (step.choiceText) {
        const choiceKey = `choice:${step.sceneId}:${step.choiceText}`;
        const choiceNodeId = addNode(choiceKey, `[${step.choiceText}]`, 'choice', { tooltip: step.choiceText }, branchIndex);
        if (!edges.find(e => e.source === prevNodeId && e.target === choiceNodeId)) {
          edges.push({ id: `${prevNodeId}->${choiceNodeId}`, source: prevNodeId, target: choiceNodeId });
        }
        prevNodeId = choiceNodeId;
      }
    }
    return prevNodeId;
  }

  // Recursively add dependencies and playable path, merging at shared nodes
  function addActionWithDeps(actionId: string, parentId?: string, visited: Set<string> = new Set(), branchIndex = 0) {
    if (visited.has(actionId)) {
      if (parentId) edges.push({ id: `${parentId}->${actionId}`, source: parentId, target: nodeMap.get(`action:${actionId}`)! });
      return;
    }
    visited.add(actionId);
    const action = actions[actionId];
    if (!action) return;
    const desc = getActionDescription(action);
    const isDep = endpointDeps.has(actionId);
    // If this is a dependency-satisfying action, add all playable paths to it
    if (isDep) {
      const depScenes = findScenesForAction(scenes, actionId);
      depScenes.forEach((sceneId, depIdx) => {
        const scenePaths = findScenePaths(scenes, 'forest_clearing', sceneId);
        scenePaths.forEach((path) => {
          const lastNodeId = addPlayablePath(path, branchIndex + depIdx);
          const actionNodeId = addNode(`action:${actionId}`, `{${actionId}${desc ? ': ' + desc : ''}}`, 'action', { tooltip: desc, isDependency: isDep }, branchIndex + depIdx);
          if (lastNodeId && !edges.find(e => e.source === lastNodeId && e.target === actionNodeId)) {
            edges.push({ id: `${lastNodeId}->${actionNodeId}`, source: lastNodeId, target: actionNodeId });
          }
          // Recursively add dependencies for this action
          let depBranch = 1;
          for (const dep of getDependencies(action)) {
            if (dep.cond.type === 'flagSet' || dep.cond.type === 'hasItem') {
              const depActions = findActionsForDependency(actions, dep.type, dep.key);
              if (depActions.length > 0) {
                for (const depActionId of depActions) {
                  addActionWithDeps(depActionId, actionNodeId, new Set(visited), branchIndex + depBranch);
                  depBranch++;
                }
              } else {
                const depNodeId = addNode(`dep:${dep.type}:${dep.key}`, `[Needs ${dep.type}: ${dep.key}]`, 'dependency', { tooltip: `Dependency: ${dep.type}:${dep.key}` }, branchIndex + depBranch);
                edges.push({ id: `${depNodeId}->${actionNodeId}-dep`, source: depNodeId, target: actionNodeId });
                depBranch++;
              }
            }
          }
        });
      });
      return;
    }
    // Otherwise, just add the action node
    const actionNodeId = addNode(`action:${actionId}`, `{${actionId}${desc ? ': ' + desc : ''}}`, 'action', { tooltip: desc, isDependency: isDep }, branchIndex);
    if (parentId) edges.push({ id: `${parentId}->${actionNodeId}`, source: parentId, target: actionNodeId });
    // Add dependencies
    let depBranch = 1;
    for (const dep of getDependencies(action)) {
      if (dep.cond.type === 'flagSet' || dep.cond.type === 'hasItem') {
        const depActions = findActionsForDependency(actions, dep.type, dep.key);
        if (depActions.length > 0) {
          for (const depActionId of depActions) {
            addActionWithDeps(depActionId, actionNodeId, new Set(visited), branchIndex + depBranch);
            depBranch++;
          }
        } else {
          const depNodeId = addNode(`dep:${dep.type}:${dep.key}`, `[Needs ${dep.type}: ${dep.key}]`, 'dependency', { tooltip: `Dependency: ${dep.type}:${dep.key}` }, branchIndex + depBranch);
          edges.push({ id: `${depNodeId}->${actionNodeId}-dep`, source: depNodeId, target: actionNodeId });
          depBranch++;
        }
      }
    }
  }

  // Find all scenes that reference the endpoint action
  const endpointScenes = findScenesForAction(scenes, endpointActionId);
  for (const sceneId of endpointScenes) {
    const scenePaths = findScenePaths(scenes, 'forest_clearing', sceneId);
    scenePaths.forEach((path) => {
      const lastNodeId = addPlayablePath(path, 0);
      const actionNodeId = addNode(`action:${endpointActionId}`, `{${endpointActionId}${getActionDescription(actions[endpointActionId]) ? ': ' + getActionDescription(actions[endpointActionId]) : ''}}`, 'action', { tooltip: getActionDescription(actions[endpointActionId]), isDependency: false }, 0);
      if (lastNodeId && !edges.find(e => e.source === lastNodeId && e.target === actionNodeId)) {
        edges.push({ id: `${lastNodeId}->${actionNodeId}`, source: lastNodeId, target: actionNodeId });
      }
      // Recursively add dependencies for the endpoint action
      let depBranch = 1;
      for (const dep of getDependencies(actions[endpointActionId])) {
        if (dep.cond.type === 'flagSet' || dep.cond.type === 'hasItem') {
          const depActions = findActionsForDependency(actions, dep.type, dep.key);
          if (depActions.length > 0) {
            for (const depActionId of depActions) {
              addActionWithDeps(depActionId, actionNodeId, new Set(), depBranch);
              depBranch++;
            }
          } else {
            const depNodeId = addNode(`dep:${dep.type}:${dep.key}`, `[Needs ${dep.type}: ${dep.key}]`, 'dependency', { tooltip: `Dependency: ${dep.type}:${dep.key}` }, depBranch);
            edges.push({ id: `${depNodeId}->${actionNodeId}-dep`, source: depNodeId, target: actionNodeId });
            depBranch++;
          }
        }
      }
    });
  }
  if (endpointScenes.length === 0) {
    addActionWithDeps(endpointActionId);
  }
  return { nodes, edges };
}

export default function StoryThreader() {
  const actionsObj = useGameStore((state) => state.actions);
  const scenesObj = useGameStore((state) => state.scenes);
  const setActions = useGameStore((state) => state.setActions);
  const setScenes = useGameStore((state) => state.setScenes);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/games/${game}/`);
      const { actions, scenes } = await res.json();
      setActions(actions);
      setScenes(scenes);
    }
    if (!actionsObj || !scenesObj) fetchData();
  }, [game, actionsObj, scenesObj, setActions, setScenes]);

  const graph = useMemo(() => buildStoryGraph(actionsObj || {}, scenesObj || {}), [actionsObj, scenesObj]);
  const deadEnds = useMemo(() => findDeadEndActions(actionsObj || {}, graph), [actionsObj, graph]);
  const endpoints = useMemo(
    () => selectedEndpoint ? [selectedEndpoint] : deadEnds,
    [selectedEndpoint, deadEnds]
  );

  // Build the tree for each endpoint
  const treesByEndpoint = useMemo(() => {
    const result: Record<string, TreeNode> = {};
    for (const endpoint of endpoints) {
      result[endpoint] = buildDependencyTree(actionsObj || {}, scenesObj || {}, endpoint);
    }
    return result;
  }, [actionsObj, scenesObj, endpoints]);

  // Build linear paths for each endpoint
  const linearPathsByEndpoint = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const endpoint of endpoints) {
      const paths = findAllActionPaths(scenesObj || {}, actionsObj || {}, 'forest_clearing', endpoint);
      result[endpoint] = paths.map(p => formatPathOneLiner(p, scenesObj || {}, actionsObj || {}));
    }
    return result;
  }, [actionsObj, scenesObj, endpoints]);

  // Build dependency graph for each endpoint
  const depGraphsByEndpoint = useMemo(() => {
    const result: Record<string, { nodes: Node[]; edges: Edge[] }> = {};
    for (const endpoint of endpoints) {
      result[endpoint] = buildDependencyGraph(actionsObj || {}, scenesObj || {}, endpoint);
    }
    return result;
  }, [actionsObj, scenesObj, endpoints]);

  return (
    <div style={{ padding: 32, background: '#f8fafc', minHeight: '100vh' }}>
      <DeveloperNav />
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Story Threader (Tree View)</h2>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 600, fontSize: 16, marginRight: 8 }}>Endpoint Action:</label>
        <select
          value={selectedEndpoint || ''}
          onChange={e => setSelectedEndpoint(e.target.value || null)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16 }}
        >
          <option value="">(All Dead-End Actions)</option>
          {deadEnds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
      </div>
      {endpoints.map(endpoint => (
        <div key={endpoint} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>Dependency Tree for <span style={{ color: '#b35c1e' }}>{endpoint}</span></h3>
          {renderTree(treesByEndpoint[endpoint])}
          <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0ea5e9', margin: '18px 0 6px 0' }}>Linear Path(s):</h4>
          <ul style={{ fontFamily: 'monospace', fontSize: 15, background: '#fff', borderRadius: 6, padding: 16, margin: 0, boxShadow: '0 1px 4px #0001' }}>
            {linearPathsByEndpoint[endpoint]?.length ? linearPathsByEndpoint[endpoint].map((line, i) => (
              <li key={i} style={{ marginBottom: 2 }}>{line}</li>
            )) : <li style={{ color: '#888' }}>(No path found from Forest Clearing)</li>}
          </ul>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: '#a21caf', margin: '18px 0 6px 0' }}>Dependency Graph:</h4>
          <div style={{ height: 400, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 8 }}>
            <ReactFlow
              nodes={depGraphsByEndpoint[endpoint].nodes}
              edges={depGraphsByEndpoint[endpoint].edges}
              fitView
              minZoom={0.2}
              maxZoom={1.5}
              nodeTypes={{ 'dependency-action': CustomNode }}
            >
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      ))}
    </div>
  );
} 