import React from 'react';
import type { Scene } from '@/app/types';

export function SceneSidebarListItem({ scene }: { scene: Scene }) {
  return (
    <div className="border-b border-slate-200 bg-white transition hover:bg-blue-50 hover:shadow-md hover:scale-[1.03]">
      <div className="px-2 py-1">
        <div className="text-[13px] font-bold text-slate-800 truncate leading-tight">{scene.location || scene.id}</div>
        <div className="text-[12px] text-slate-600 truncate" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {scene.description || ''}
        </div>
      </div>
    </div>
  );
} 