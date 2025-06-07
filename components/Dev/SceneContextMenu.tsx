import React from 'react';
import { Edit, Copy, Trash2 } from 'lucide-react';

interface SceneContextMenuProps {
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  style?: React.CSSProperties;
  menuRef?: React.Ref<HTMLDivElement>;
}

export default function SceneContextMenu({ onEdit, onCopy, onDelete, onClose, style, menuRef }: SceneContextMenuProps) {
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      ref={menuRef}
      className="w-36 bg-white border border-slate-200 rounded shadow-lg z-[1000]"
      style={style}
      onClick={stopPropagation}
    >
      {onEdit && <button className="flex items-center gap-2 px-4 py-2 w-full text-slate-700 hover:bg-slate-100" onClick={() => { onEdit(); onClose(); }}><Edit size={16} /> Edit</button>}
      {onCopy && <button className="flex items-center gap-2 px-4 py-2 w-full text-slate-700 hover:bg-slate-100" onClick={() => { onCopy(); onClose(); }}><Copy size={16} /> Copy</button>}
      {onDelete && <button className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-red-50" onClick={() => { onDelete(); onClose(); }}><Trash2 size={16} /> Delete</button>}
    </div>
  );
} 