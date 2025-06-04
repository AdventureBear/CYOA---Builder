import React, { useRef, useState, useEffect } from 'react';
import type { Scene } from '@/app/types';
import { MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';

export function SceneSidebarDetailModal({ scene, parentScenes, onEdit, onCopy, onDelete, onClose, anchorRect }: {
  scene: Scene;
  parentScenes: string[];
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  anchorRect?: { top: number; height: number } | null;
}) {
  // Choices as A), B), C)...
  const choiceLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Sidebar + panel width (64 + 280)
  const left = 64 + 280 ; // 8px gap
  // Modal height (estimate, or could use ref for dynamic)
  const modalHeight = 380;
  let style: React.CSSProperties;
  if (anchorRect) {
    // If too close to bottom, pin to bottom
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    if (anchorRect.top + modalHeight > windowHeight - 24) {
      style = {
        position: 'fixed',
        left,
        bottom: 24,
        width: 450,
        maxWidth: '95vw',
        zIndex: 50,
      };
    } else {
      style = {
        position: 'fixed',
        left,
        top: anchorRect.top,
        width: 450,
        maxWidth: '95vw',
        zIndex: 50,
      };
    }
  } else {
    style = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 450,
      maxWidth: '95vw',
      zIndex: 50,
    };
  }

  // Menu open/close logic
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-500/10 z-40"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Modal */}
      <div style={style} className="bg-white  shadow-xl p-4 rounded" onClick={e => e.stopPropagation()}>
        {/* Top row: Location and ID */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-slate-700">{scene.location || 'No location'} <span className="text-slate-400">({scene.id})</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button ref={menuButtonRef} className="p-1 rounded-full hover:bg-slate-100 transition" aria-label="More" onClick={() => setMenuOpen(v => !v)}>
                <MoreVertical size={22} />
              </button>
              {menuOpen && (
                <div ref={menuRef} className="absolute left-full top-0 ml-2 w-36 bg-white border border-slate-200 rounded shadow-lg z-10">
                  <button className="flex items-center gap-2 px-4 py-2 w-full text-slate-700 hover:bg-slate-100" onClick={() => { setMenuOpen(false); onEdit && onEdit(); }}><Edit size={16} /> Edit</button>
                  <button className="flex items-center gap-2 px-4 py-2 w-full text-slate-700 hover:bg-slate-100" onClick={() => { setMenuOpen(false); onCopy && onCopy(); }}><Copy size={16} /> Copy</button>
                  <button className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-red-50" onClick={() => { setMenuOpen(false); onDelete && onDelete(); }}><Trash2 size={16} /> Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Parent Scenes */}
        <div className="mb-1 text-[13px] font-semibold text-slate-700">Parent Scene(s): <span className="font-normal text-slate-600">{parentScenes.length ? parentScenes.join(', ') : 'None'}</span></div>
        {/* Leads to */}
        <div className="mb-1 text-[13px] font-semibold text-slate-700">Leads to: <span className="font-normal text-slate-600">{(scene.choices || []).map(c => c.nextNodeId).filter(Boolean).join(', ') || 'None'}</span></div>
        {/* Actions */}
        <div className="mb-1 text-[12px] text-slate-500">Actions: <span className="text-slate-600">{(scene.actions || []).join(', ') || 'None'}</span></div>
        {/* Description */}
        <div className="mb-2 text-[14px] text-slate-800">{scene.description || <span className="italic text-slate-400">No description</span>}</div>
        {/* Choices */}
        <div className="mb-2">
          {(scene.choices || []).length > 0 && (
            <div className="text-[14px] text-slate-700">
              {(scene.choices || []).map((choice, idx) => (
                <div key={idx} className="mb-0.5">{choiceLetters[idx]}) {choice.text}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 