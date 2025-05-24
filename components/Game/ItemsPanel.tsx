import React, { useState } from 'react';

interface Item {
  name: string;
  quantity?: number;
  icon?: string;
}

interface ItemsPanelProps {
  items: Item[];
  gridSize: number;
  defaultIcon: string;
  icons: Record<string, string>;
  showQuantity?: boolean;
}

export function ItemsPanel({ items, gridSize, defaultIcon, icons, showQuantity = false }: ItemsPanelProps) {
  const [selected, setSelected] = useState<Item | null>(null);

  // Fill up to gridSize with empty slots
  const slots = [
    ...items,
    ...Array(Math.max(0, gridSize - items.length)).fill(null),
  ];

  return (
    <aside className="w-full max-w-xs shrink-0 text-amber-100/90 pt-0 pb-2 px-2">
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {slots.map((item, idx) =>
          item ? (
            <div
              key={item.name}
              className="relative group flex flex-col items-center justify-center cursor-pointer bg-[#2d2d2d]/60 rounded p-1 sm:p-1.5 border border-amber-900/30 hover:bg-[#3a2f1a]/80 transition min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]"
              onClick={() => setSelected(item)}
            >
              <span className="text-3xl sm:text-4xl">{icons[item.name] || defaultIcon}</span>
              {showQuantity && item.quantity && item.quantity > 1 && (
                <span className="absolute bottom-0 right-0 text-xs bg-black/70 px-1 rounded text-amber-200">x{item.quantity}</span>
              )}
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-black/80 text-xs text-amber-100 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                {item.name.replace(/_/g, ' ')}
              </span>
            </div>
          ) : (
            <div
              key={"empty-" + idx}
              className="flex flex-col items-center justify-center bg-[#2d2d2d]/30 rounded p-1 sm:p-1.5 border border-dashed border-amber-900/20 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]"
            >
              <span className="text-2xl text-amber-900/30">—</span>
            </div>
          )
        )}
      </div>
      {/* Item popup */}
      {selected && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#ece5db]/80" 
          onClick={() => setSelected(null)}
        >
          <div 
            className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2" 
            style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" 
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <span className="text-7xl mb-4">{icons[selected.name] || defaultIcon}</span>
              <div className="font-bold text-xl mb-2 font-runic text-[#5a4632]">
                {selected.name.replace(/_/g, ' ')}
              </div>
              {showQuantity && selected.quantity && (
                <div className="text-sm mb-3 text-[#5a4632]/80">Quantity: {selected.quantity}</div>
              )}
              {/* Description section */}
              <div className="w-full p-3 bg-[#bfae99]/20 rounded-lg text-sm text-[#5a4632]/90">
                <p className="text-center">More information about this item will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
} 