import React from 'react';

interface FooterTogglesProps {
  onInventory: () => void;
  onMap: () => void;
  onAchievements: () => void;
  onJournal: () => void;
}

const FooterToggles: React.FC<FooterTogglesProps> = ({ onInventory, onMap, onAchievements, onJournal }) => (
  <div className="absolute bottom-0 left-0 w-full flex justify-around py-2 border-t bg-white z-40 lg:hidden">
    <button onClick={onInventory} aria-label="Inventory" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
      <span className="text-2xl">🧺</span>
      <span className="text-[10px] font-runic">Inventory</span>
    </button>
    <button onClick={onMap} aria-label="Map" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
      <span className="text-2xl">🗺️</span>
      <span className="text-[10px] font-runic">Map</span>
    </button>
    <button onClick={onAchievements} aria-label="Achievements" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
      <span className="text-2xl">🏆</span>
      <span className="text-[10px] font-runic">Achievements</span>
    </button>
    <button onClick={onJournal} aria-label="Journal" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
      <span className="text-2xl">📖</span>
      <span className="text-[10px] font-runic">Journal</span>
    </button>
  </div>
);

export default FooterToggles; 