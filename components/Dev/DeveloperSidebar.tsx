'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Image,
  Rabbit,
} from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

import SceneManagerPanel from './SceneManagerPanel';
import ActionManagerPanel from './ActionManagerPanel';


const links = [
  { href: '/developer', label: 'Dashboard', icon: LayoutDashboard, panel: null },
  { href: '#', label: 'Scenes', icon: Image, panel: 'scene' },
  { href: '#', label: 'Actions', icon: Rabbit, panel: 'action' },
];

export type PanelType = 'scene' | 'action' | null;

export function DeveloperSidebar({ onPanel, activePanel }: { onPanel: (panel: PanelType) => void; activePanel: PanelType }) {
    const pathname = usePathname();
    const { contextualControls } = useUiStore();
    
    return (
      <aside
        className="sticky top-0 h-screen bg-slate-100 flex flex-col items-center border-r border-slate-200 z-30"
        style={{ width: 64, minWidth: 64 }}
      >
        <nav className="flex-1 flex flex-col gap-2 mt-4 w-full items-center">
          {links.map(link => {
            const Icon = link.icon;
            const isButton = link.href === '#';
            const isActive = isButton ? activePanel === link.panel : pathname === link.href;

            if (isButton) {
                return (
                    <button
                        key={link.label}
                        onClick={() => onPanel(link.panel as PanelType)}
                        className={`flex flex-col items-center justify-center w-full py-2 rounded transition-colors ${
                            isActive ? 'bg-blue-200 text-blue-900' : 'text-slate-800 hover:bg-slate-200'
                        }`}
                        style={{ lineHeight: 1.1, fontSize: '10px' }}
                        title={link.label}
                    >
                      <Icon size={22} className={isActive ? 'text-blue-700' : 'text-slate-500'} />
                      <span className="mt-1 font-small text-center">{link.label}</span>
                    </button>
                )
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full py-2 rounded transition-colors ${
                  isActive ? 'bg-blue-200 text-blue-900' : 'text-slate-800 hover:bg-slate-200'
                }`}
                style={{ lineHeight: 1.1, fontSize: '10px' }}
                title={link.label}
              >
                <Icon size={22} className={isActive ? 'text-blue-700' : 'text-slate-500'} />
                <span className="mt-1 font-small text-center">{link.label}</span>
              </Link>
            );
          })}
        
          {contextualControls.length > 0 && (
            <div className="w-full border-t border-slate-200 my-2"></div>
          )}

          {contextualControls.map(control => {
              const Icon = control.icon;
              return (
                  <button
                      key={control.label}
                      onClick={control.onClick}
                      className={`flex flex-col items-center justify-center w-full py-2 rounded text-slate-800 hover:bg-slate-200 transition-colors`}
                      style={{ lineHeight: 1.1, fontSize: '10px' }}
                      title={control.label}
                  >
                  <Icon size={22} className={'text-slate-500'} />
                  <span className="mt-1 font-small text-center">{control.label}</span>
                  </button>
              )
          })}
        </nav>
      </aside>
    );
  }


export function SlidingPanel({ openPanel, onClose, gameId }: { openPanel: PanelType; onClose: () => void; gameId: string | null; }) {
  let header = '';
  let content = null;

  if (!gameId) {
      return null;
  }

  switch (openPanel) {
    case 'scene':
      header = 'Scene Manager';
      content = <SceneManagerPanel gameId={gameId} />;
      break;
    case 'action':
      header = 'Action Manager';
      content = <ActionManagerPanel gameId={gameId} />;
      break;
  }

  return (
    <div className={`fixed left-16 bg-white shadow-lg border-r border-slate-200 z-20 transition-all duration-300 ${openPanel ? 'translate-x-0 w-[350px]' : '-translate-x-full w-0'}`} style={{ top: 40, height: 'calc(100vh - 40px)' }}>
      {openPanel && (
        <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
                <h3 className="font-bold text-lg">{header}</h3>
                <button className="text-slate-500 hover:text-blue-600 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
            </div>
            <div className="h-[calc(100%-50px)] overflow-y-auto">
                {content}
            </div>
        </>
      )}
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