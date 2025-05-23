import React from 'react';
// import Image from 'next/image';

interface InventoryProps {
  items: Record<string, number>;
}

export function Inventory({ items }: InventoryProps) {
  const itemEntries = Object.entries(items);

  return (
    <div className="w-full bg-[#ece5db]/90 border-t-2 border-[#bfae99]">
      {/* Inventory header */}
      <div className="w-full flex items-center px-8 py-2 bg-[#ece5db]/90 border-b-2 border-[#bfae99] font-runic text-[#5a4632] text-base tracking-wide">
        Inventory
      </div>
      
      {/* Inventory grid */}
      <div className="p-4">
        {itemEntries.length === 0 ? (
          <div className="text-center text-[#5a4632] py-8">
            Your inventory is empty
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {itemEntries.map(([name, quantity]) => (
              <div
                key={name}
                className="bg-[#e0d3b8]/90 border-2 border-[#bfae99] p-2 flex flex-col items-center group hover:bg-[#d1c2a3] transition cursor-pointer"
              >
                <div className="relative w-full aspect-square mb-2">
                  <div className="w-full h-full flex items-center justify-center bg-[#bfae99]/20">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-[#5a4632] text-sm">{name}</div>
                  {quantity > 1 && (
                    <div className="text-xs text-[#5a4632]/80">x{quantity}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 