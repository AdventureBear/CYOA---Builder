import React from 'react';
import { InventoryPanel } from './InventoryPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { DiaryPanel } from './DiaryPanel';

interface GameSidebarProps {
  inventory: Record<string, number>;
  achievements: Record<string, boolean>;
}

const GameSidebar: React.FC<GameSidebarProps> = ({ inventory, achievements }) => (
  <aside className="hidden lg:flex flex-col w-80 min-w-[18rem] max-w-xs border-l-2 border-[#bfae99] bg-[#ece5db]/90 p-4 gap-4 overflow-y-auto lg:h-full">
    <div>
      <h2 className="text-lg font-bold mb-2">Inventory</h2>
      <InventoryPanel inventory={inventory} />
    </div>
    <div>
      <h2 className="text-lg font-bold mb-2">Achievements</h2>
      <AchievementsPanel achievements={achievements} />
    </div>
    <div>
      <h2 className="text-lg font-bold mb-2">Journal</h2>
            <DiaryPanel />    
    </div>
  </aside>
);

export default GameSidebar; 