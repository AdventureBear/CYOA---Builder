import React, { useRef, useState, useEffect } from 'react';
import type { Scene } from '@/app/types';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SceneContextMenu from '@/components/Dev/SceneContextMenu';

export function SceneSidebarDetailModal({ scene, onEdit, onDelete, onCopy, onClose, anchorRect, sidebarRect }: {
  scene: Scene;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onClose?: () => void;
  anchorRect?: { top: number; height: number } | null;
  sidebarRect?: DOMRect | null;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    if (isMenuOpen && modalRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: `${modalRect.top}px`,
        left: `${modalRect.right + 4}px`,
        zIndex: 100,
      });
    }
  }, [isMenuOpen]);

  // Choices as A), B), C)...
  // const choiceLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Modal height (estimate, or could use ref for dynamic)
  const modalHeight = 380;
  const modalWidth = 450;
  let style: React.CSSProperties;
  if (anchorRect && sidebarRect) {
    const left = sidebarRect.right + 4;
    // If too close to bottom, pin to bottom
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    if (anchorRect.top + modalHeight > windowHeight - 24) {
      style = {
        position: 'fixed',
        left,
        bottom: 24,
        width: modalWidth,
        maxWidth: '95vw',
        zIndex: 50,
      };
    } else {
      style = {
        position: 'fixed',
        left,
        top: anchorRect.top,
        width: modalWidth,
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
      width: modalWidth,
      maxWidth: '95vw',
      zIndex: 50,
    };
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-500/10 z-40"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* Modal */}
      <div ref={modalRef} style={style} className="bg-white shadow-xl p-4 rounded-lg" onClick={e => e.stopPropagation()}>
        {/* Top row: Location and ID */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold text-slate-700">{scene.location || 'No location'} <span className="text-slate-400 font-normal">({scene.id})</span></span>
          </div>
          <div className="flex items-center">
            {onEdit && (
                <Button ref={menuButtonRef} onClick={handleMenuClick} variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                </Button>
            )}
          </div>
        </div>

        <div className="mb-2">
            <div className="mb-1 text-[13px] font-semibold text-slate-700">Actions</div>
            <div className="text-[14px] text-slate-600">{(scene.actions || []).join(', ') || 'None'}</div>
        </div>
       
        <div className="mb-2">
            <div className="mb-1 text-[13px] font-semibold text-slate-700">Description</div>
            <div className="text-[14px] text-slate-600">{scene.description || <span className="italic text-slate-400">No description</span>}</div>
        </div>

        {(scene.choices || []).length > 0 && (
            <div className="mb-2">
                <div className="mb-1 text-[13px] font-semibold text-slate-700">Choices</div>
                <ol className="list-alpha pl-5 text-[14px] text-slate-600 space-y-1">
                    {(scene.choices || []).map((choice, idx) => (
                        <li key={idx}>{choice.text}</li>
                    ))}
                </ol>
            </div>
        )}
      </div>
      {isMenuOpen && (
        <SceneContextMenu
          menuRef={menuRef}
          onEdit={onEdit}
          onCopy={onCopy}
          onDelete={onDelete}
          onClose={() => setIsMenuOpen(false)}
          style={menuStyle}
        />
      )}
    </>
  );
} 