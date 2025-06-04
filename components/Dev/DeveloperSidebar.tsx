'use client';
import { usePathname } from 'next/navigation';
import { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Image,
  Rabbit,
  Workflow,
  ListTree,
  UploadCloud,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { createPortal } from 'react-dom';
import { SceneSidebarListItem } from '@/components/Dev/SceneManager/SceneSidebarListItem';
import { SceneSidebarDetailModal } from '@/components/Dev/SceneManager/SceneSidebarDetailModal';
import { getSceneCategories } from '@/lib/sceneUtils';

const links = [
  { href: '/developer', label: 'Dashboard', icon: LayoutDashboard, panel: null },
  { href: '/developer/scenes', label: 'Scene\nManager', icon: Image, panel: 'scene' },
  { href: '/developer/actions', label: 'Action\nManager', icon: Rabbit, panel: 'action' },
  { href: '/developer/visualizer', label: 'Storyline\nVisualizer', icon: Workflow, panel: 'visualizer' },
  { href: '/developer/threader', label: 'Story\nThreader', icon: ListTree, panel: 'threader' },
  { href: '/developer/import', label: 'Bulk\nImport/Export', icon: UploadCloud, panel: 'import' },
];

export function DeveloperSidebar({ onPanel }: { onPanel: (panel: PanelType | null) => void }) {
  const pathname = usePathname();
  return (
    <aside
      className="sticky top-0 h-screen bg-slate-100 flex flex-col items-center border-r border-slate-200 z-30"
      style={{ width: 64, minWidth: 64, fontSize: 10 }}
    >
      <nav className="flex-1 flex flex-col gap-2 mt-4 w-full items-center">
        {links.map(link => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <button
              key={link.href}
              className={`flex flex-col items-center justify-center w-full py-2 rounded hover:bg-slate-200 transition-colors ${
                active ? 'bg-blue-200 text-blue-900' : 'text-slate-800'
              }`}
              style={{ lineHeight: 1.1 }}
              onClick={() => onPanel(link.panel as PanelType)}
              title={link.label.replace('\n', ' ')}
            >
              <Icon size={22} className={active ? 'text-blue-700' : 'text-slate-500'} />
              <span className="mt-1 whitespace-pre font-small text-center">
                {link.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

type PanelType = 'scene' | 'action' | 'visualizer' | 'threader' | 'import' | null;

export function SlidingPanel({ openPanel, onClose }: { openPanel: PanelType; onClose: () => void }) {
  const [accordionOpen, setAccordionOpen] = useState({
    all: true,
    disconnected: false,
    missing: false,
    orphaned: false,
  });
  const [detailSceneId, setDetailSceneId] = useState<string | null>(null);
  const [detailSceneRect, setDetailSceneRect] = useState<{ top: number; height: number } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // Get scenes and actions from store
  const scenesObj = useGameStore((state) => state.scenes);
  const actionsObj = useGameStore((state) => state.actions);
  const scenes = scenesObj ? Object.values(scenesObj) : [];
  const entryId = 'forest_clearing';
  const { disconnectedScenes, orphanedSceneIds, missingSceneIds } = getSceneCategories(scenes, actionsObj, entryId);
  let header = '';
  let content = null;
  // Helper to get parent scenes for a given scene id
  function getParentScenes(sceneId: string) {
    return scenes.filter(s => (s.choices || []).some(c => c.nextNodeId === sceneId)).map(s => s.id);
  }
  // Helper to get scene by id
  function getSceneById(id: string) {
    return scenes.find(s => s.id === id);
  }
  switch (openPanel) {
    case 'scene':
      header = 'Scene Manager';
      content = <>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <button className="bg-blue-600 text-white rounded w-7 h-7 flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition">+</button>
          <input type="text" placeholder="Search..." className="flex-1 px-2 py-1 rounded border border-slate-200 text-[13px] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-110px)] px-2 pt-2" ref={sidebarRef} style={{ position: 'relative' }}>
          <AccordionSection title="All Scenes" open={accordionOpen.all} onClick={() => setAccordionOpen(a => ({ ...a, all: !a.all }))} color="#e6fae6">
            {scenes.filter(scene => !orphanedSceneIds.includes(scene.id)).map((scene) => (
              <div
                key={scene.id}
                onClick={e => {
                  setDetailSceneId(scene.id);
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setDetailSceneRect({ top: rect.top, height: rect.height });
                }}
                style={{ position: 'relative', cursor: 'pointer' }}
                className={`scene-list-item ${detailSceneId === scene.id ? 'selected' : ''} transition hover:bg-blue-50 hover:shadow-md hover:scale-[1.03]'`}
              >
                <SceneSidebarListItem scene={scene} />
              </div>
            ))}
          </AccordionSection>
          <AccordionSection title="Disconnected Scenes" open={accordionOpen.disconnected} onClick={() => setAccordionOpen(a => ({ ...a, disconnected: !a.disconnected }))} color="#e6f0fa">
            {disconnectedScenes.map((scene) => (
              <div
                key={scene.id}
                onClick={e => {
                  setDetailSceneId(scene.id);
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setDetailSceneRect({ top: rect.top, height: rect.height });
                }}
                style={{ position: 'relative', cursor: 'pointer' }}
                className={`scene-list-item ${detailSceneId === scene.id ? 'selected' : ''} transition hover:bg-blue-50 hover:shadow-md hover:scale-[1.03]'`}
              >
                <SceneSidebarListItem scene={scene} />
              </div>
            ))}
          </AccordionSection>
          <AccordionSection title="Missing Scenes" open={accordionOpen.missing} onClick={() => setAccordionOpen(a => ({ ...a, missing: !a.missing }))} color="#fffbe6">
            {missingSceneIds.map((id) => (
              <div
                key={id}
                onClick={e => {
                  setDetailSceneId(id);
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setDetailSceneRect({ top: rect.top, height: rect.height });
                }}
                style={{ position: 'relative', cursor: 'pointer' }}
                className={`scene-list-item ${detailSceneId === id ? 'selected' : ''} transition hover:bg-blue-50 hover:shadow-md hover:scale-[1.03]'`}
              >
                <SceneSidebarListItem scene={{ id, name: id, description: '', location: '', season: '', isRequired: false, choices: [], actions: [], locationImage: '' }} />
              </div>
            ))}
          </AccordionSection>
          <AccordionSection title="Orphaned Scenes" open={accordionOpen.orphaned} onClick={() => setAccordionOpen(a => ({ ...a, orphaned: !a.orphaned }))} color="#fae6e6">
            {orphanedSceneIds.map((id) => {
              const scene = scenes.find(s => s.id === id);
              return scene ? (
                <div
                  key={scene.id}
                  onClick={e => {
                    setDetailSceneId(scene.id);
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setDetailSceneRect({ top: rect.top, height: rect.height });
                  }}
                  style={{ position: 'relative', cursor: 'pointer' }}
                  className={`scene-list-item ${detailSceneId === scene.id ? 'selected' : ''} transition hover:bg-blue-50 hover:shadow-md hover:scale-[1.03]'`}
                >
                  <SceneSidebarListItem scene={scene} />
                </div>
              ) : null;
            })}
          </AccordionSection>
          {/* Detail modal (portal, only one at a time) */}
          {detailSceneId && (() => {
            const scene = getSceneById(detailSceneId) || { id: detailSceneId, name: detailSceneId, description: '', location: '', season: '', isRequired: false, choices: [], actions: [], locationImage: '' };
            const parentScenes = getParentScenes(detailSceneId);
            return createPortal(
              <SceneSidebarDetailModal
                scene={scene}
                parentScenes={parentScenes}
                onClose={() => setDetailSceneId(null)}
                onEdit={() => {}}
                onCopy={() => {}}
                onDelete={() => {}}
                anchorRect={detailSceneRect}
              />,
              document.body
            );
          })()}
        </div>
      </>;
      break;
    case 'action':
      header = 'Action Manager';
      content = <div className="p-4">(Action Manager content...)</div>;
      break;
    case 'visualizer':
      header = 'Storyline Visualizer';
      content = <div className="p-4">(Visualizer content...)</div>;
      break;
    case 'threader':
      header = 'Story Threader';
      content = <div className="p-4">(Threader content...)</div>;
      break;
    case 'import':
      header = 'Bulk Import/Export';
      content = <div className="p-4">(Import/Export content...)</div>;
      break;
    default:
      break;
  }
  return (
    <div className={`h-screen bg-white shadow-lg border-r border-slate-200 z-40 transition-all duration-300 ${openPanel ? 'translate-x-0' : '-translate-x-[300px] pointer-events-none opacity-0'}`} style={{ width: 280, minWidth: 280 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="font-bold text-lg">{header}</span>
        <button className="text-slate-500 hover:text-blue-600 text-xl font-bold" onClick={onClose} aria-label="Close">×</button>
      </div>
      {content}
    </div>
  );
}

export function DeveloperSidebarsWrapper({ children }: { children: React.ReactNode }) {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  return (
    <div className="flex h-full">
      <DeveloperSidebar onPanel={setOpenPanel} />
      <SlidingPanel openPanel={openPanel} onClose={() => setOpenPanel(null)} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

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