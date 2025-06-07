import React, { useRef, useState, useEffect } from 'react';
import type { Action } from '@/app/types';
import { MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';

export function ActionContextMenu({ onEdit, onCopy, onDelete, onClose, style, menuRef }: {
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
  menuRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={menuRef}
      className="absolute left-full top-0 ml-2 w-36 bg-white border border-slate-200 rounded shadow-lg z-1000"
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <button className="flex items-center gap-2 px-4 py-2 w-full text-slate-700 hover:bg-slate-100" onClick={() => { onClose && onClose(); onEdit && onEdit(); }}><Edit size={16} /> Edit</button>
      <button className="flex items-center gap-2 px-4 py-2 w-full text-slate-700 hover:bg-slate-100" onClick={() => { onClose && onClose(); onCopy && onCopy(); }}><Copy size={16} /> Copy</button>
      <button className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-red-50" onClick={() => { onClose && onClose(); onDelete && onDelete(); }}><Trash2 size={16} /> Delete</button>
    </div>
  );
}

export function ActionSidebarDetailModal({ action, onEdit, onCopy, onDelete, onClose, anchorRect }: {
  action: Action;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  anchorRect?: { top: number; height: number } | null;
}) {
  const left = 64 + 280; // Sidebar + panel width
  const modalHeight = 300;
  let style: React.CSSProperties;
  if (anchorRect) {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    if (anchorRect.top + modalHeight > windowHeight - 24) {
      style = { position: 'fixed', left, bottom: 24, width: 450, zIndex: 50 };
    } else {
      style = { position: 'fixed', left, top: anchorRect.top, width: 450, zIndex: 50 };
    }
  } else {
    style = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 450, zIndex: 50 };
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && menuButtonRef.current && !menuButtonRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      <div className="fixed inset-0 bg-slate-500/10 z-40" onClick={onClose} aria-label="Close modal" />
      <div style={style} className="bg-white shadow-xl p-4 rounded" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-bold text-slate-700">{action.id}</h3>
            <div className="relative">
              <button ref={menuButtonRef} className="p-1 rounded-full hover:bg-slate-100 transition" aria-label="More" onClick={() => setMenuOpen(v => !v)}>
                <MoreVertical size={22} />
              </button>
              {menuOpen && (
                <ActionContextMenu onEdit={onEdit} onCopy={onCopy} onDelete={onDelete} onClose={() => setMenuOpen(false)} menuRef={menuRef} />
              )}
            </div>
        </div>
        
        <div className="text-[14px] space-y-2">
            <p><strong>Trigger:</strong> {action.trigger}</p>
            <p><strong>Fail Message:</strong> {action.failMessage || <span className="italic text-slate-500">None</span>}</p>
            <div>
                <strong>Conditions:</strong>
                {action.conditions && action.conditions.length > 0 ? (
                    <ul className="list-disc pl-5 text-slate-600">
                        {action.conditions.map((c, i) => <li key={i}>{c.type} {c.key} {c.comparator} {c.value}</li>)}
                    </ul>
                ) : <span className="italic text-slate-500"> None</span>}
            </div>
             <div>
                <strong>Outcomes:</strong>
                {action.outcomes && action.outcomes.length > 0 ? (
                    <ul className="list-disc pl-5 text-slate-600">
                        {action.outcomes.map((o, i) => (
                            <li key={i}>
                                {o.description} 
                                {o.stateChanges.map((sc, j) => <div key={j} className="pl-4">&rarr; {sc.type} {sc.key} {sc.amount}</div>)}
                            </li>
                        ))}
                    </ul>
                ) : <span className="italic text-slate-500"> None</span>}
            </div>
        </div>

      </div>
    </>
  );
} 