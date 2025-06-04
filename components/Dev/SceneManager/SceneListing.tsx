import React from 'react';
import type { Scene } from '@/app/types';

export function SceneListing({ scenes, type, onEdit, onDelete, onAdd }: {
  scenes: Scene[] | string[];
  type: 'active' | 'orphaned' | 'missing' | 'disconnected';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: (id: string) => void;
}) {
  // Determine border and header color based on type
  const borderColor = type === 'active' ? 'border-green-500' : type === 'missing' ? 'border-yellow-300' : type === 'disconnected' ? 'border-blue-300' : 'border-red-300';
  const headerBg = type === 'active' ? 'bg-green-50' : type === 'missing' ? 'bg-yellow-50' : type === 'disconnected' ? 'bg-blue-50' : 'bg-red-50';
  const headerText = 'text-slate-900';
  return (
    <div className={`border ${borderColor} rounded-lg mb-0 overflow-hidden bg-white`}>
      {scenes.length > 0 && (
        <div className={`flex items-center gap-4 ${headerBg} font-bold text-[15px] ${headerText} px-3 py-2 border-b border-slate-200`}>
          <div className="flex-[1.2]">Location</div>
          <div className="flex-1">ID</div>
          <div className="flex-[4]">Description</div>
          <div className="flex flex-1 justify-end gap-2">Actions</div>
        </div>
      )}
      <ul className="list-none p-0 m-0 bg-white">
        {scenes.map((scene) => {
          const id = typeof scene === 'string' ? scene : scene.id;
          const location = typeof scene === 'string' ? undefined : scene.location;
          const description = typeof scene === 'string' ? undefined : scene.description;
          return (
            <li
              key={id}
              className={`flex items-center gap-4 bg-white border-b border-slate-200 shadow-sm px-3 py-2 text-[15px] w-full min-w-0 ${
                (type === 'active' || type === 'missing' || type === 'disconnected') ? 'cursor-pointer transition hover:bg-slate-100' : ''
              }`}
              onClick={
                (type === 'active' && onEdit) ? () => onEdit(id)
                  : (type === 'missing' && onAdd) ? () => onAdd(id)
                  : (type === 'disconnected' && onEdit) ? () => onEdit(id)
                  : undefined
              }
              onKeyDown={
                (type === 'active' && onEdit) ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEdit(id); }
                  : (type === 'missing' && onAdd) ? (e) => { if (e.key === 'Enter' || e.key === ' ') onAdd(id); }
                  : (type === 'disconnected' && onEdit) ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEdit(id); }
                  : undefined
              }
              role={(type === 'active' || type === 'missing' || type === 'disconnected') ? 'button' : undefined}
              tabIndex={(type === 'active' || type === 'missing' || type === 'disconnected') ? 0 : undefined}
            >
              <div className="flex-[1.2] font-bold text-black truncate">{location || ''}</div>
              <div className="flex-1 text-slate-500 text-[14px] truncate">({id})</div>
              <div className="flex-[4] text-slate-700 text-[14px] truncate">{description ? description.slice(0, 60) : ''}</div>
              <div className="flex gap-2 flex-1 justify-end">
                {(type === 'active' || type === 'orphaned' || type === 'disconnected') && onEdit && (
                  <button
                    className="bg-blue-600 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-blue-700 transition"
                    onClick={e => { e.stopPropagation(); onEdit(id); }}
                  >Edit</button>
                )}
                {(type === 'active' || type === 'orphaned' || type === 'disconnected') && onDelete && (
                  <button
                    className="bg-red-500 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-red-600 transition"
                    onClick={e => { e.stopPropagation(); onDelete(id); }}
                  >Delete</button>
                )}
                {type === 'missing' && onAdd && (
                  <button
                    className="bg-green-500 text-white rounded px-3 py-1 font-semibold text-[13px] hover:bg-green-600 transition"
                    onClick={e => { e.stopPropagation(); onAdd(id); }}
                  >Add</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 