'use client';
import { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { getSceneCategories } from '@/lib/sceneUtils';
import { SceneSidebarListItem } from '@/components/Dev/SceneManager/SceneSidebarListItem';
import { SceneSidebarDetailModal } from '@/components/Dev/SceneManager/SceneSidebarDetailModal';
import { Scene } from '@/app/types';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';
import SceneForm from '@/components/Dev/SceneForm';
import { saveSceneAndUpdateStore } from '@/lib/sceneHandlers';

// AccordionSection component
function AccordionSection({ title, open, onClick, children, color }: { title: string; open: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
    return (
      <div
        className="mb-2 rounded-lg overflow-hidden border border-slate-300"
        style={color ? { background: color } : {}}
      >
        <button
          className="flex items-center w-full px-2 py-1 text-left font-semibold text-[13px] text-slate-700 hover:bg-slate-100 rounded-none transition"
          onClick={onClick}
          style={{ background: 'transparent' }}
        >
          <span className={`mr-2 transition-transform ${open ? 'rotate-90' : ''}`} style={{ color: '#b0b6be', fontWeight: 400, fontSize: 16 }}>▶</span>
          {title}
        </button>
        {open && <div className="mt-1">{children}</div>}
      </div>
    );
}

export default function SceneManagerPanel({ gameId }: { gameId: string }) {
    const [accordionOpen, setAccordionOpen] = useState({
        all: true,
        disconnected: false,
        missing: false,
        orphaned: false,
    });
    const [detailSceneId, setDetailSceneId] = useState<string | null>(null);
    const [detailSceneRect, setDetailSceneRect] = useState<{ top: number; height: number } | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [sidebarRect, setSidebarRect] = useState<DOMRect | null>(null);

    const { scenes: scenesObj, actions: actionsObj } = useGameStore();
    const { setEditingScene, setDeletingScene } = useUiStore();
    const scenes = useMemo(() => scenesObj ? Object.values(scenesObj) : [], [scenesObj]);
    
    const { disconnectedScenes, orphanedSceneIds, missingSceneIds } = useMemo(() => {
        return getSceneCategories(scenes, actionsObj, 'forest_clearing');
    }, [scenes, actionsObj]);
    
    function getParentScenes(sceneId: string) {
        return scenes.filter(s => (s.choices || []).some(c => c.nextNodeId === sceneId)).map(s => s.id);
    }
    
    function getSceneById(id: string) {
        return scenes.find(s => s.id === id);
    }

    if (!scenesObj) return <div className="p-4">Loading scenes...</div>;
  
    return <>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <button className="bg-blue-600 text-white rounded w-7 h-7 flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition">+</button>
            <input type="text" placeholder="Search..." className="flex-1 px-2 py-1 rounded border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="overflow-y-auto h-[calc(100%-65px)] px-2 pt-2" ref={sidebarRef} style={{ position: 'relative' }}>
            <AccordionSection title="All Scenes" open={accordionOpen.all} onClick={() => setAccordionOpen(a => ({ ...a, all: !a.all }))} color="#e6fae6">
                {scenes.filter(scene => !orphanedSceneIds.includes(scene.id)).map((scene) => (
                <div key={scene.id} onClick={e => { setDetailSceneId(scene.id); setDetailSceneRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setSidebarRect(sidebarRef.current?.getBoundingClientRect() ?? null); }} style={{ position: 'relative', cursor: 'pointer' }} >
                    <SceneSidebarListItem scene={scene} />
                </div>
                ))}
            </AccordionSection>
            <AccordionSection title="Disconnected Scenes" open={accordionOpen.disconnected} onClick={() => setAccordionOpen(a => ({ ...a, disconnected: !a.disconnected }))} color="#e6f0fa">
                {disconnectedScenes.map((scene) => (
                <div key={scene.id} onClick={e => { setDetailSceneId(scene.id); setDetailSceneRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setSidebarRect(sidebarRef.current?.getBoundingClientRect() ?? null); }} style={{ position: 'relative', cursor: 'pointer' }} >
                    <SceneSidebarListItem scene={scene} />
                </div>
                ))}
            </AccordionSection>
            <AccordionSection title="Missing Scenes" open={accordionOpen.missing} onClick={() => setAccordionOpen(a => ({ ...a, missing: !a.missing }))} color="#fffbe6">
                {missingSceneIds.map((id) => (
                <div key={id} onClick={e => { setDetailSceneId(id); setDetailSceneRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setSidebarRect(sidebarRef.current?.getBoundingClientRect() ?? null); }} style={{ position: 'relative', cursor: 'pointer' }} >
                    <SceneSidebarListItem scene={{ id, name: id, description: '', location: '', season: '', isRequired: false, choices: [], actions: [], locationImage: '' }} />
                </div>
                ))}
            </AccordionSection>
            <AccordionSection title="Orphaned Scenes" open={accordionOpen.orphaned} onClick={() => setAccordionOpen(a => ({ ...a, orphaned: !a.orphaned }))} color="#fae6e6">
                {orphanedSceneIds.map((id) => {
                const scene = scenes.find(s => s.id === id);
                return scene ? (
                    <div key={scene.id} onClick={e => { setDetailSceneId(scene.id); setDetailSceneRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setSidebarRect(sidebarRef.current?.getBoundingClientRect() ?? null); }} style={{ position: 'relative', cursor: 'pointer' }} >
                        <SceneSidebarListItem scene={scene} />
                    </div>
                ) : null;
                })}
            </AccordionSection>

            {detailSceneId && (() => {
                const scene = getSceneById(detailSceneId) || { id: detailSceneId, name: detailSceneId, description: '', location: '', season: '', isRequired: false, choices: [], actions: [], locationImage: '' };
                const parentScenes = getParentScenes(detailSceneId);
                return createPortal(
                <SceneSidebarDetailModal
                    scene={scene}
                    parentScenes={parentScenes}
                    onClose={() => setDetailSceneId(null)}
                    onEdit={() => {
                        setDetailSceneId(null);
                        setEditingScene(scene);
                    }}
                    onDelete={() => {
                        setDetailSceneId(null);
                        setDeletingScene(scene);
                    }}
                    onCopy={() => {
                        alert('Copy scene not implemented yet.');
                        setDetailSceneId(null);
                    }}
                    anchorRect={detailSceneRect}
                    sidebarRect={sidebarRect}
                />,
                document.body
                );
            })()}
        </div>
    </>;
} 