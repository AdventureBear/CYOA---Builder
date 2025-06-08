'use client';
import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { Action } from '@/app/types';
import ActionModal from '@/components/Dev/ActionModal';
import { ActionSidebarListItem } from './ActionManager/ActionSidebarListItem';
import { ActionSidebarDetailModal } from './ActionManager/ActionSidebarDetailModal';
import { saveActionAndUpdateStore, deleteActionAndUpdateStore } from '@/lib/actionHandlers';

// AccordionSection component - might move to a shared file later
function AccordionSection({ title, open, onClick, children, color }: { title: string; open: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
    return (
      <div className="mb-2 rounded-lg overflow-hidden border border-slate-300" style={color ? { background: color } : {}}>
        <button className="flex items-center w-full px-2 py-1 text-left font-semibold text-[13px] text-slate-700 hover:bg-slate-100 rounded-none transition" onClick={onClick} style={{ background: 'transparent' }}>
          <span className={`mr-2 transition-transform ${open ? 'rotate-90' : ''}`} style={{ color: '#b0b6be', fontWeight: 400, fontSize: 16 }}>▶</span>
          {title}
        </button>
        {open && <div className="mt-1">{children}</div>}
      </div>
    );
}

export default function ActionManagerPanel({ gameId }: { gameId: string }) {
    const { actions: actionsObj, scenes: scenesObj, setActions } = useGameStore();
    const { editingAction, setEditingAction, setDeletingAction } = useUiStore();

    const [accordionOpen, setAccordionOpen] = useState({ router: true, all: true, missing: false, orphaned: false });
    const [detailActionId, setDetailActionId] = useState<string | null>(null);
    const [detailActionRect, setDetailActionRect] = useState<{ top: number; height: number } | null>(null);

    const actions = useMemo(() => actionsObj ? Object.values(actionsObj) : [], [actionsObj]);
    const scenes = useMemo(() => scenesObj ? Object.values(scenesObj) : [], [scenesObj]);

    const { routerActions, nonRouterActions, missingActionIds, orphanedActions, actionToScenesMap } = useMemo(() => {
        const existingActionIds = new Set(actions.map(a => a.id));
        const referencedActionIds = new Set<string>();
        const actionToScenesMap = new Map<string, string[]>();

        scenes.forEach(scene => {
            const processActionReference = (actionId: string | undefined) => {
                if (!actionId) return;
                referencedActionIds.add(actionId);
                if (!actionToScenesMap.has(actionId)) {
                    actionToScenesMap.set(actionId, []);
                }
                const sceneList = actionToScenesMap.get(actionId)!;
                if (!sceneList.includes(scene.id)) {
                    sceneList.push(scene.id);
                }
            };
            (scene.actions || []).forEach(actionId => processActionReference(actionId));
            (scene.choices || []).forEach(choice => processActionReference(choice.nextAction));
        });

        const routerActions = actions.filter(a => a.id.startsWith('route_'));
        const nonRouterActions = actions.filter(a => !a.id.startsWith('route_'));
        const missingActionIds = Array.from(referencedActionIds).filter(id => !existingActionIds.has(id));
        const orphanedActions = actions.filter(a => !a.id.startsWith('route_') && !referencedActionIds.has(a.id));

        return { routerActions, nonRouterActions, missingActionIds, orphanedActions, actionToScenesMap };
    }, [actions, scenes]);

    const handleSave = async (updatedAction: Action) => {
        try {
            await saveActionAndUpdateStore({
                form: updatedAction,
                actionsObj,
                setActions,
                game: gameId,
            });
            setEditingAction(null);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to save action');
        }
    };

    const handleDelete = async (action: Action) => {
        try {
            await deleteActionAndUpdateStore({
                actionId: action.id,
                gameId,
                actions: actionsObj || {},
                setActions,
            });
            setDetailActionId(null);
            setDeletingAction(null);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to delete action');
        }
    };

    const handleEdit = (action: Action) => {
        setDetailActionId(null);
        setEditingAction(action);
    };

    const handleCopy = (action: Action) => {
        const newId = `${action.id}_copy`;
        const newAction = { ...action, id: newId };
        setEditingAction(newAction);
    }

    if (!actionsObj) return <div className="p-4">Loading actions...</div>;

    const detailAction = detailActionId ? actions.find(a => a.id === detailActionId) : null;
    const scenesUsingAction = detailActionId ? actionToScenesMap.get(detailActionId) || [] : [];

    return <>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <button onClick={() => setEditingAction({ id: '', trigger: 'onEnter', outcomes: [], conditions: [], failMessage: ''})} className="bg-blue-600 text-white rounded w-7 h-7 flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition">+</button>
            <input type="text" placeholder="Search..." className="flex-1 px-2 py-1 rounded border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="overflow-y-auto h-[calc(100%-65px)] px-2 pt-2">
            <AccordionSection title="Router Actions" open={accordionOpen.router} onClick={() => setAccordionOpen(a => ({ ...a, router: !a.router }))} color="#e6f0fa">
                {routerActions.map(action => <div key={action.id} onClick={(e) => {setDetailActionId(action.id); setDetailActionRect((e.currentTarget as HTMLElement).getBoundingClientRect());}}><ActionSidebarListItem action={action} /></div>)}
            </AccordionSection>
            <AccordionSection title="All Actions" open={accordionOpen.all} onClick={() => setAccordionOpen(a => ({ ...a, all: !a.all }))} color="#e6fae6">
                {nonRouterActions.map(action => <div key={action.id} onClick={(e) => {setDetailActionId(action.id); setDetailActionRect((e.currentTarget as HTMLElement).getBoundingClientRect());}}><ActionSidebarListItem action={action} /></div>)}
            </AccordionSection>
            <AccordionSection title="Missing Actions" open={accordionOpen.missing} onClick={() => setAccordionOpen(a => ({ ...a, missing: !a.missing }))} color="#fffbe6">
                {missingActionIds.map(id => <div key={id} className="p-2 text-sm italic text-slate-500">{id}</div>)}
            </AccordionSection>
            <AccordionSection title="Orphaned Actions" open={accordionOpen.orphaned} onClick={() => setAccordionOpen(a => ({ ...a, orphaned: !a.orphaned }))} color="#fae6e6">
                {orphanedActions.map(action => <div key={action.id} onClick={(e) => {setDetailActionId(action.id); setDetailActionRect((e.currentTarget as HTMLElement).getBoundingClientRect());}}><ActionSidebarListItem action={action} /></div>)}
            </AccordionSection>
        </div>

        {detailAction && (
            <ActionSidebarDetailModal 
                action={detailAction}
                scenesUsingAction={scenesUsingAction}
                onClose={() => setDetailActionId(null)} 
                onEdit={() => handleEdit(detailAction)}
                onCopy={() => handleCopy(detailAction)}
                onDelete={() => handleDelete(detailAction)}
                anchorRect={detailActionRect}
             />
        )}

        {editingAction && (
            <ActionModal
                action={editingAction}
                isEditing={!!(actionsObj && actionsObj[editingAction.id])}
                onSave={handleSave}
                onClose={() => setEditingAction(null)}
                actions={actions}
                scenes={scenes}
            />
        )}
    </>;
}

