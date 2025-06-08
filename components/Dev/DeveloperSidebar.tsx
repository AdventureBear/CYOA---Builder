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
  { href: '#', label: 'Scenes', icon: Image, panel: 'scenes' },
  { href: '#', label: 'Actions', icon: Rabbit, panel: 'actions' },
];

export type PanelType = 'scenes' | 'actions' | null;

export function DeveloperSidebar({ onPanel, activePanel }: { onPanel: (panel: PanelType) => void; activePanel: PanelType }) {
    const pathname = usePathname();
    const { contextualControls } = useUiStore();
    
    return (
      <aside
        className="sticky top-10 h-[calc(100vh-40px)] bg-slate-100 flex flex-col items-center border-r border-slate-200 z-30"
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

          {contextualControls.map((control) => {
              const Icon = control.icon;
              return (
                  <button
                      key={control.id}
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
    case 'scenes':
      header = 'Scene Manager';
      content = <SceneManagerPanel />;
      // content = <SceneManagerPanel gameId={gameId} />;
      break;
    case 'actions':
      header = 'Action Manager';
      content = <ActionManagerPanel gameId={gameId} />;
      break;
  }

  return (
    <div className={`fixed left-16 bg-white shadow-lg border-r border-slate-200 z-20 transition-all duration-300 overflow-hidden ${openPanel ? 'w-[280px]' : 'w-0'}`} style={{ top: 40, height: 'calc(100vh - 40px)' }}>
      <div className="w-[280px] h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 flex-shrink-0">
            <h3 className="font-bold text-lg whitespace-nowrap">{header}</h3>
            <button className="text-slate-500 hover:text-blue-600 text-2xl font-bold" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="flex-grow overflow-y-auto">
            {content}
        </div>
      </div>
    </div>
  );
} 