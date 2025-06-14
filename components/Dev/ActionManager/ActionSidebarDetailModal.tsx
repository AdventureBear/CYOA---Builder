'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Action } from '@/app/types';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionContextMenu from './ActionContextMenu';
import { formatCondition } from '@/lib/actionUtils';

export function ActionSidebarDetailModal({ action, scenesUsingAction, onClose, onEdit, onCopy, onDelete, anchorRect, sidebarRect }: {
  action: Action;
  scenesUsingAction: string[];
  onClose?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
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



  const modalHeight = 300; // estimate
  const modalWidth = 450;
  let style: React.CSSProperties;
  if (anchorRect && sidebarRect) {
    const left = sidebarRect.right + 4;
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
        <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-slate-700">{action.id} <span className="text-slate-400 font-normal">(Trigger: {action.trigger})</span></span>
            </div>
            {(onEdit || onCopy || onDelete) && (
                <Button ref={menuButtonRef} onClick={handleMenuClick} variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical size={16} />
                </Button>
            )}
        </div>

        <div className="mb-2">
            <div className="mb-1 text-[13px] font-semibold text-slate-700">Used in Scene(s)</div>
            <div className="text-[14px] text-slate-600">{scenesUsingAction.length ? scenesUsingAction.join(', ') : 'None'}</div>
        </div>

        {action.conditions && action.conditions.length > 0 && (
            <div className="mb-2">
                <div className="mb-1 text-[13px] font-semibold text-slate-700">Conditions</div>
                {action.conditions.length > 1 ? (
                    <ol className="list-decimal pl-5 text-[14px] text-slate-600 space-y-1">
                        {action.conditions.map((condition, index) => (
                            <li key={index}>{formatCondition(condition)}</li>
                        ))}
                    </ol>
                ) : (
                    <div className="text-[14px] text-slate-600">
                        {formatCondition(action.conditions[0])}
                    </div>
                )}
            </div>
        )}
        
        {action.failMessage && (
            <div className="mb-2">
                <div className="mb-1 text-[13px] font-semibold text-slate-700">Fail Message</div>
                <div className="text-[14px] text-slate-600">{action.failMessage}</div>
            </div>
        )}
        
        {action.outcomes && action.outcomes.length > 0 && (
             <div className="mb-2">
                <div className="mb-1 text-[13px] font-semibold text-slate-700">Outcomes</div>
                {action.outcomes.length > 1 ? (
                    <ol className="list-decimal pl-5 text-[14px] text-slate-600 space-y-1">
                        {action.outcomes.map((outcome, index) => (
                            <li key={index}>{outcome.description || <span className="italic text-slate-400">No description</span>}</li>
                        ))}
                    </ol>
                ) : (
                    <div className="text-[14px] text-slate-600">
                        {action.outcomes[0].description || <span className="italic text-slate-400">No description</span>}
                    </div>
                )}
            </div>
        )}
      </div>
      {isMenuOpen && (
        <ActionContextMenu
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