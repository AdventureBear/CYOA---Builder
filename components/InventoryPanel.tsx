/* ---------------- InventoryPanel.tsx ---------------- */
import React, { useState } from 'react';

// Placeholder for item images (can be extended later)
const ITEM_ICONS: Record<string, string> = {
  silver: '🪙',
  map: '🗺️',
  shiny_pebble: '💎',
  stick: '🪵',
  gratitude_token: '🎟️',
  helped_hedgehog: '🦔',
  helped_bird: '🐦',
  friend_beaver: '🦫',
  // Add more mappings as needed
};

const INVENTORY_SIZE = 15; // 5 columns x 3 rows

export function InventoryPanel({ inventory }: { inventory: Record<string, number>; }) {
  const items = Object.entries(inventory);
  console.log('inventory', inventory);
  
  const [selected, setSelected] = useState<null | { name: string; quantity: number }>(null);

  // Fill up to INVENTORY_SIZE with empty slots
  const slots = [
    ...items.map(([name, quantity]) => ({ name, quantity })),
    ...Array(Math.max(0, INVENTORY_SIZE - items.length)).fill(null),
  ];


  
  return (
    <aside className="w-full max-w-xs shrink-0 text-amber-100/90 pt-0 pb-2 px-2">
      <div className="grid grid-cols-5 gap-1">
        {slots.map((item, idx) =>
          item ? (
            <div
              key={item.name}
              className="relative group flex flex-col items-center justify-center cursor-pointer bg-[#2d2d2d]/60 rounded p-0.5 border border-amber-900/30 hover:bg-[#3a2f1a]/80 transition min-h-[38px] min-w-[38px]"
              onClick={() => setSelected(item)}
            >
              <span className="text-2xl">{ITEM_ICONS[item.name] || '📦'}</span>
              {item.quantity > 1 && (
                <span className="absolute bottom-0 right-0 text-xs bg-black/70 px-1 rounded text-amber-200">x{item.quantity}</span>
              )}
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-amber-100 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                {item.name}
              </span>
            </div>
          ) : (
            <div
              key={"empty-" + idx}
              className="flex flex-col items-center justify-center bg-[#2d2d2d]/30 rounded p-0.5 border border-dashed border-amber-900/20 min-h-[38px] min-w-[38px]"
            >
              <span className="text-xl text-amber-900/30">—</span>
            </div>
          )
        )}
      </div>
      {/* Item popup */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelected(null)}>
          <div className="bg-[#ece5db] text-[#3d2c1a] rounded-lg shadow-lg p-6 min-w-[220px] max-w-xs relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-lg" onClick={() => setSelected(null)}>&times;</button>
            <div className="flex flex-col items-center">
              <span className="text-5xl mb-2">{ITEM_ICONS[selected.name] || '📦'}</span>
              <div className="font-bold text-lg mb-1">{selected.name}</div>
              <div className="text-sm mb-2">Quantity: {selected.quantity}</div>
              {/* Placeholder for more info: description, stats, etc. */}
              <div className="text-xs text-[#5a4632]">More information about this item will appear here.</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
  