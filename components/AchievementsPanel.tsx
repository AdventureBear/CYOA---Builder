import React, { useState } from 'react';

const ACHIEVEMENT_ICONS: Record<string, string> = {
  helped_bird: '🐦',
  helped_hedgehog: '🦔',
  friend_beaver: '🦫',
  gratitude_token: '🎟️',
  shiny_pebble: '💎',
  // Add more as needed
};

const GRID_SIZE = 12; // Show up to 12 achievements in a grid

export function AchievementsPanel({ achievements }: { achievements: Record<string, boolean> }) {
  const earned = Object.entries(achievements).filter(([, v]) => v);
  const [selected, setSelected] = useState<null | { name: string }>(null);

  // Fill up to GRID_SIZE with empty slots
  const slots = [
    ...earned.map(([name]) => ({ name })),
    ...Array(Math.max(0, GRID_SIZE - earned.length)).fill(null),
  ];

  return (
    <aside className="w-52 shrink-0 bg-[#1a1a1a]/80 backdrop-blur-sm text-amber-100/90 border-l border-amber-900/40 p-2">
      <h3 className="text-sm font-bold text-amber-200 font-runic mb-1">Achievements</h3>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot, idx) =>
          slot ? (
            <button
              key={slot.name}
              className={`flex flex-col items-center justify-center bg-[#2d2d2d]/50 p-2 rounded border border-amber-900/30 text-amber-100 hover:bg-amber-900/30 transition focus:outline-none ${selected?.name === slot.name ? 'ring-2 ring-amber-400' : ''}`}
              onClick={() => setSelected(slot)}
              title={slot.name}
            >
              <span className="text-2xl mb-1">{ACHIEVEMENT_ICONS[slot.name] || '🏆'}</span>
              <span className="text-[10px] truncate">{slot.name.replace(/_/g, ' ')}</span>
            </button>
          ) : (
            <div key={idx} className="flex flex-col items-center justify-center bg-[#2d2d2d]/30 p-2 rounded border border-amber-900/10 text-amber-700 opacity-40">
              <span className="text-2xl mb-1">🏆</span>
              <span className="text-[10px]">—</span>
            </div>
          )
        )}
      </div>
      {selected && (
        <div className="mt-2 p-2 bg-[#2d2d2d]/80 rounded text-xs border border-amber-900/30 text-amber-100">
          <span className="text-2xl mr-2 align-middle">{ACHIEVEMENT_ICONS[selected.name] || '🏆'}</span>
          <span className="align-middle font-bold">{selected.name.replace(/_/g, ' ')}</span>
        </div>
      )}
    </aside>
  );
} 