'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  useNodesState,
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  Position,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { useGameStore } from '@/store/gameStore';
import { Action, Scene } from '@/app/types';
import SceneNode from '@/components/Dev/SceneNode';
import Modal from '@/components/ui/Modal';
import SceneForm from '@/components/Dev/SceneForm';
import { useLoadScenesAndActions } from '@/lib/useLoadScenesAndActions';
import { saveSceneAndUpdateStore } from '@/lib/sceneHandlers';
import { Button } from '@/components/ui/button';
import ActionModal from '@/components/Dev/ActionModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';




/* 0. Helper to map variant id -> hub id */
// function hubId(id: string) {
//     return id.replace(/_(spring|summer|fall|winter|morning|afternoon|evening)$/, '');
//   }

/* ------------------------------------------------------------------
   buildGraph — ONE arrow per real navigation direction
   • dashed parent → child, solid normal choices
   • "Return to …" links get no label
   -----------------------------------------------------------------*/

   
 function buildGraph(
    scenes: Record<string, Scene>,
    handleEdit: (sceneId: string) => void,
    handleNeighbors: (sceneId: string) => void,
    handleHighlightNeighbors: (sceneId: string) => void
  ): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const pairInfo = new Map<
      string,
      {
        fromParent?: string;   // label we want (choice in parent scene)
        fwd?: boolean;         // lexical A< B arrow
        rev?: boolean;         // reverse arrow
        parentDir?: "AtoB" | "BtoA";
      }
    >();
  
    const keyOf = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  
    /* ---------- scan scenes ------------------------------------------ */
    Object.values(scenes).forEach((scene, idx) => {
      /* node */
      nodes.push({
        id: scene.id,
        type: 'scene',
        // data: { label: scene.id },
        position: { x: (idx % 4) * 120, y: Math.floor(idx / 4) * 120 },
        style: { width: 160, padding: 8, fontSize: 12 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: scene.id,
          onEdit: () => handleEdit(scene.id),
          onNeighbors: () => handleNeighbors(scene.id),
          onHighlightNeighbors: () => handleHighlightNeighbors(scene.id),
        },
      });
  
      /* parent relationship */
      if (scene.parentSceneId) {
        const parentId = scene.parentSceneId;
        const key = keyOf(parentId, scene.id);
        const info = pairInfo.get(key) || {};
  
        // which direction is parent→child?
        info.parentDir = parentId < scene.id ? "AtoB" : "BtoA";
  
        // grab the choice text from the parent scene (if exists)
        const parent = scenes[parentId];
        const txt = parent?.choices?.find((c) => c.nextNodeId === scene.id)?.text;
        if (txt) info.fromParent = txt;
  
        // set direction flag
        if (parentId < scene.id) info.fwd = true; else info.rev = true;
  
        pairInfo.set(key, info);
      }
  
      /* normal choices */
      scene.choices?.forEach((ch) => {
        if (!ch.nextNodeId) return;
  
        // skip "Return to ..." choices (child back to parent)
        const isReturn = ch.nextNodeId === scene.parentSceneId;
        if (isReturn) return;
  
        const from = scene.id;
        const to = ch.nextNodeId;
        const key = keyOf(from, to);
        const info = pairInfo.get(key) || {};
  
        // label only if this scene is the parent in the pair
        if (from === scene.id) info.fromParent = ch.text;
  
        // direction flags
        if (from < to) info.fwd = true; else info.rev = true;
  
        pairInfo.set(key, info);
      });
    });
  
    /* ---------- build final edges ------------------------------------ */
    const edges: Edge[] = [];
  
    pairInfo.forEach((info, key) => {
      const [a, b] = key.split("|");
      const twoWay = info.fwd && info.rev;
      // const parentIsA = info.parentDir === "AtoB";
  
      edges.push({
        id: key,
        source: a,
        target: b,
        label: info.fromParent,                       // parent choice text
        style: info.parentDir
          ? { strokeDasharray: "4 4", stroke: "#888" }  // dashed parent link
          : { stroke: "#3399ff" },
        labelStyle: { fill: "#3399ff", fontSize: 9 },
  
        // arrow heads
        markerEnd:
          (twoWay || info.fwd) ? { type: MarkerType.ArrowClosed, width: 10, height: 10 } : undefined,
        markerStart:
          (twoWay || info.rev) ? { type: MarkerType.ArrowClosed, width: 10, height: 10 } : undefined,
      });
    });
  
    return { nodes, edges };
  }
  
  

/* ---------- component ---------------------------------------------- */
export default function SceneFlow() {
  console.log('SceneFlow mounted');
  const { toast } = useToast();
  useLoadScenesAndActions();
  const scenes = useGameStore((s) => s.scenes);
  const actions = useGameStore((s) => s.actions);
  console.log('scenes from store:', scenes);
  console.log('actions from store:', actions);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const [selectedScene, setSelectedScene] = React.useState<Scene | null>(null);
  const [selectedAction, setSelectedAction] = React.useState<Action | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importActionModalOpen, setImportActionModalOpen] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [importActionJson, setImportActionJson] = useState('');
  const [importActionError, setImportActionError] = useState<string | null>(null);
  const [importingActions, setImportingActions] = useState(false);
  const handleNeighbors = (sceneId: string) => setSelectedNodeId(sceneId);

  const handleEdit = React.useCallback((sceneId: string) => {
    if (!scenes) return;
    const scene = scenes[sceneId];
    if (scene) {
      setSelectedScene(scene);
      setModalOpen(true);
    }
  }, [scenes]);

  // New: highlight neighbors handler
  const handleHighlightNeighbors = (sceneId: string) => {
    setSelectedNodeId(sceneId);
    // setModalOpen(true);
  };

  const handleSave = async (updatedScene: Scene) => {
    const scenesObj = useGameStore.getState().scenes;
    const setScenes = useGameStore.getState().setScenes;
    const scenesArr = Object.values(scenesObj || {});
    const editIndex = scenesArr.findIndex(s => s.id === updatedScene.id);
    const game = 'cute-animals'; // Or get from search params if available
    try {
      await saveSceneAndUpdateStore({
        form: updatedScene,
        editIndex,
        scenes: scenesArr,
        scenesObj,
        setScenes,
        game,
      });
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save scene');
    }
  };

 // nodeTypes for React Flow
const nodeTypes = useMemo(() => ({ scene: SceneNode }), []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraph(scenes || {}, handleEdit, handleNeighbors, handleHighlightNeighbors),
    [scenes, handleEdit]
  );

  // Set nodes directly from initialNodes (no dagre layout)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Highlight logic
  const outgoing = new Set<string>();
  const incoming = new Set<string>();
  const twoWay = new Set<string>();
  if (selectedNodeId && scenes) {
    // Outgoing: selected node's choices
    const selectedScene = scenes[selectedNodeId];
    if (selectedScene && selectedScene.choices) {
      selectedScene.choices.forEach(ch => {
        if (ch.nextNodeId) outgoing.add(ch.nextNodeId);
      });
    }
    // Incoming: any scene whose choices point to selected node
    Object.values(scenes).forEach(scene => {
      if (scene.id === selectedNodeId) return;
      scene.choices?.forEach(ch => {
        if (ch.nextNodeId === selectedNodeId) incoming.add(scene.id);
        // Check for two-way
        if (ch.nextNodeId === selectedNodeId && selectedScene.choices?.some(c2 => c2.nextNodeId === scene.id)) {
          twoWay.add(scene.id);
        }
      });
    });
  }

  const edgesWithHighlight = initialEdges.map(edge => {
    let style = { ...edge.style };
    let isOutgoing = false, isIncoming = false, isTwoWay = false;
    if (selectedNodeId) {
      if (edge.source === selectedNodeId && outgoing.has(edge.target)) {
        isOutgoing = true;
        if (twoWay.has(edge.target)) isTwoWay = true;
      } else if (edge.target === selectedNodeId && incoming.has(edge.source)) {
        isIncoming = true;
        if (twoWay.has(edge.source)) isTwoWay = true;
      }
    }
    if (isTwoWay) {
      style = { ...style, strokeDasharray: '4 4', stroke: '#888', strokeWidth: 3 };
    } else if (isOutgoing) {
      style = { ...style, stroke: 'green', strokeWidth: 3 };
    } else if (isIncoming) {
      style = { ...style, stroke: 'red', strokeWidth: 3 };
    }
    return { ...edge, style };
  });

  console.log('nodes:', nodes, 'edges:', edgesWithHighlight);

  // Helper for blank scene
  const blankScene: Scene = {
    id: '',
    name: '',
    description: '',
    location: '',
    season: '',
    isRequired: false,
    choices: [],
  };

  //helper for blank action
  const blankAction: Action = {
    id: '',
    trigger: 'onEnter',
    conditions: [],
    outcomes: [],
    failMessage: '',
  };
  // "find_message": {
  //   "id": "find_message",
  //   "trigger": "onEnter",
  //   "conditions": [
  //     {
  //       "type": "flagSet",
  //       "key": "robin_asked"
  //     },
  //     {
  //       "type": "flagNotSet",
  //       "key": "found_message"
  //     },
  //     {
  //       "type": "flagSet",
  //       "key": "helped_bird"
  //     }
  //   ],
    // "outcomes": [
    //   {
    //     "description": "You spot a tiny note wedged in the the birds nest. It's from Robin's cousin!",
    //     "stateChanges": [
    //       {
    //         "type": "setFlag",
    //         "key": "found_message"
    //       }
    //     ],
    //     "choices": [
    //       {
    //         "text": "Read the message",
    //         "resultMessage": "The note says: 'Meet me at the meadow at dusk.'",
    //         "resultButtonText": "Put the note away"
    //       }
    //     ]
    //   }
    // ]

  // Validate a scene object
  function isValidScene(obj: unknown): obj is Scene {
    if (typeof obj !== 'object' || obj === null) return false;
    const o = obj as Record<string, unknown>;
    return (
      typeof o.id === 'string' &&
      typeof o.description === 'string' &&
      typeof o.location === 'string' &&
      Array.isArray(o.choices)
    );
  }

  async function handleImport() {
    setImportError(null);
    setImporting(true);
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch (e) {
      setImportError('Invalid JSON');
      setImporting(false);
      return;
    }
    let scenesToImport: Scene[] = [];
    if (Array.isArray(parsed)) {
      scenesToImport = parsed.filter(isValidScene);
      if (scenesToImport.length !== parsed.length) {
        setImportError('Some items in the array are not valid scenes.');
        setImporting(false);
        return;
      }
    } else if (isValidScene(parsed)) {
      scenesToImport = [parsed];
    } else if (parsed && typeof parsed === 'object') {
      // Try object of scenes
      const arr = Object.values(parsed);
      if (arr.every(isValidScene)) {
        scenesToImport = arr;
      } else {
        setImportError('Object contains invalid scene(s).');
        setImporting(false);
        return;
      }
    } else {
      setImportError('JSON must be a Scene, array of Scenes, or object of Scenes.');
      setImporting(false);
      return;
    }
    // Save each scene
    if (scenesToImport.length === 0) {
      toast.error('No valid scenes found in JSON.');
      setImporting(false);
      return;
    }
    try {
      for (const scene of scenesToImport) {
        await fetch('/api/saveScene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scene, game: 'cute-animals' }),
        });
      }
      toast.success(`Imported ${scenesToImport.length} scene(s) successfully!`);
      setImportJson('');
      setTimeout(async () => {
        setImportModalOpen(false);
        // Instead of reload, fetch latest scenes and actions and update store
        try {
          const res = await fetch('/api/games/cute-animals/');
          const { scenes, actions } = await res.json();
          useGameStore.getState().setScenes(scenes);
          useGameStore.getState().setActions(actions);
        } catch (e) {
          toast.error('Imported, but failed to refresh scenes.');
        }
      }, 1200);
    } catch (e) {
      setImportError('Failed to import scene(s).');
    } finally {
      setImporting(false);
    }
  }

  if (!scenes) return <p>Loading graph…</p>;

  const initialViewport = { x: 0, y: 0, zoom: 1.2 };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col rounded-xl shadow bg-white m-4 min-h-0">
        {/* Controls inside the card */}
        <div className="flex justify-end gap-3 px-8 pt-8 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">+ Add</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setSelectedScene(blankScene); setModalOpen(true); }}>Scene</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedAction(blankAction); setShowActionModal(true); }}>Action</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Import</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setImportModalOpen(true)}>Scenes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportActionModalOpen(true)}>Actions</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 min-h-0">
          <ReactFlow
            nodes={nodes}
            edges={edgesWithHighlight}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            defaultViewport={initialViewport}
            panOnScroll
            zoomOnScroll
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            style={{ width: '100%', height: '100%' }}
          >
                  <Background
        id="1"
        gap={10}
        color="#b1b1f1"
        variant={BackgroundVariant.Dots}
      />
 
      <Background
        id="2"
        gap={100}
        color="#ccc"
        variant={BackgroundVariant.Lines}
      />
            {/* <Background gap={16} size={1} /> */}
            <MiniMap pannable zoomable />
            <Controls position="top-right" />
          </ReactFlow>
        </div>
      </div>
      <Modal open={modalOpen}>
        {selectedScene && (
          <SceneForm 
            scene={selectedScene}
            onSave={async (scene) => {
              await handleSave(scene);
              setModalOpen(false);
            }}
            actionsObj={useGameStore.getState().actions}
            allScenes={Object.values(useGameStore.getState().scenes || {})}
            setActionsObj={useGameStore.getState().setActions}
            onCancel={() => { setModalOpen(false); }}
          />
        )}
      </Modal>
      {/* Bulk Import Modal */}
      <Modal open={importModalOpen}>
        <div className="p-4 min-w-[340px] w-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Bulk Import Scenes</h3>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => setImportModalOpen(false)}
              aria-label="Close"
              className="mb-4"
            >
              <X size={24} />
            </Button>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-base text-slate-700">Scene JSON</span>
            <Button
              type="button"
              className="flex items-center gap-2  px-4 py-2"
              asChild
            >
              <label className="flex items-center cursor-pointer m-0">
                <Upload size={20} className="mr-2" /> <span >Upload File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={e => {
                    setImportError(null);
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const text = event.target?.result as string;
                        JSON.parse(text); // Validate JSON
                        setImportJson(text);
                      } catch {
                        setImportError('Uploaded file is not valid JSON.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                  disabled={importing}
                  style={{ display: 'none' }}
                />
              </label>
            </Button>
          </div>
          <textarea
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            rows={25}
            className="w-full border rounded px-2 py-1 text-[14px] font-mono"
            placeholder="Paste a Scene object, array, or object of scenes here..."
            disabled={importing}
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleImport} disabled={importing || !importJson.trim()} type="button">Import</Button>
            <Button variant="secondary" onClick={() => setImportModalOpen(false)} type="button">Close</Button>
            {importing && <span className="text-slate-500">Importing…</span>}
            {importError && <span className="text-red-600 font-semibold">{importError}</span>}
          </div>
        </div>
      </Modal>
      {/* Action Add/Edit Modal */}
      <Modal open={showActionModal}>
        {selectedAction && (
          <ActionModal
            action={selectedAction}
            isEditing={!!selectedAction.id && !!(useGameStore.getState().actions?.[selectedAction.id])}
            onSave={async (updatedAction) => {
              // Update store
              const actionsObj = useGameStore.getState().actions || {};
              const setActions = useGameStore.getState().setActions;
              const updatedActions = { ...actionsObj, [updatedAction.id]: updatedAction };
              setActions(updatedActions);
              // Persist to backend
              try {
                await fetch('/api/saveAction', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: updatedAction, game: 'cute-animals' }),
                });
                toast.success('Action saved!');
              } catch (e) {
                toast.error('Failed to save action.');
              }
              setShowActionModal(false);
              setSelectedAction(null);
            }}
            onClose={() => { setShowActionModal(false); setSelectedAction(null); }}
            actions={Object.values(useGameStore.getState().actions || {})}
            scenes={Object.values(useGameStore.getState().scenes || {})}
          />
        )}
      </Modal>
      {/* Bulk Import Actions Modal */}
      <Modal open={importActionModalOpen}>
        <div className="p-4 min-w-[340px] w-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Bulk Import Actions</h3>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => setImportActionModalOpen(false)}
              aria-label="Close"
              className="mb-4"
            >
              <X size={24} />
            </Button>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-base text-slate-700">Action JSON</span>
            <Button
              type="button"
              className="flex items-center gap-2  px-4 py-2"
              asChild
            >
              <label className="flex items-center cursor-pointer m-0">
                <Upload size={20} className="mr-2" /> <span >Upload File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={e => {
                    setImportActionError(null);
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const text = event.target?.result as string;
                        JSON.parse(text); // Validate JSON
                        setImportActionJson(text);
                      } catch {
                        setImportActionError('Uploaded file is not valid JSON.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                  disabled={importingActions}
                  style={{ display: 'none' }}
                />
              </label>
            </Button>
          </div>
          <textarea
            value={importActionJson}
            onChange={e => setImportActionJson(e.target.value)}
            rows={25}
            className="w-full border rounded px-2 py-1 text-[14px] font-mono"
            placeholder="Paste an Action object, array, or object of actions here..."
            disabled={importingActions}
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={async () => {
              setImportActionError(null);
              setImportingActions(true);
              let parsed: unknown;
              try {
                parsed = JSON.parse(importActionJson);
              } catch (e) {
                setImportActionError('Invalid JSON');
                setImportingActions(false);
                return;
              }
              // Validate Action(s)
              const isValidAction = (obj: unknown): obj is Action =>
                !!obj && typeof (obj as Action).id === 'string' && typeof (obj as Action).trigger === 'string' && Array.isArray((obj as Action).outcomes);
              let actionsToImport: Action[] = [];
              if (Array.isArray(parsed)) {
                actionsToImport = parsed.filter(isValidAction);
                if (actionsToImport.length !== parsed.length) {
                  setImportActionError('Some items in the array are not valid actions.');
                  setImportingActions(false);
                  return;
                }
              } else if (isValidAction(parsed)) {
                actionsToImport = [parsed];
              } else if (parsed && typeof parsed === 'object') {
                const arr = Object.values(parsed);
                if (arr.every(isValidAction)) {
                  actionsToImport = arr;
                } else {
                  setImportActionError('Object contains invalid action(s).');
                  setImportingActions(false);
                  return;
                }
              } else {
                setImportActionError('JSON must be an Action, array of Actions, or object of Actions.');
                setImportingActions(false);
                return;
              }
              if (actionsToImport.length === 0) {
                toast.error('No valid actions found in JSON.');
                setImportingActions(false);
                return;
              }
              try {
                for (const action of actionsToImport) {
                  await fetch('/api/saveAction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, game: 'cute-animals' }),
                  });
                }
                // Update store
                const res = await fetch('/api/games/cute-animals/');
                const { actions } = await res.json();
                useGameStore.getState().setActions(actions);
                toast.success(`Imported ${actionsToImport.length} action(s) successfully!`);
                setImportActionJson('');
                setTimeout(() => {
                  setImportActionModalOpen(false);
                }, 1200);
              } catch (e) {
                setImportActionError('Failed to import action(s).');
              } finally {
                setImportingActions(false);
              }
            }} disabled={importingActions || !importActionJson.trim()} type="button">Import</Button>
            <Button variant="secondary" onClick={() => setImportActionModalOpen(false)} type="button">Close</Button>
            {importingActions && <span className="text-slate-500">Importing…</span>}
            {importActionError && <span className="text-red-600 font-semibold">{importActionError}</span>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
