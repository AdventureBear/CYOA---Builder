import React from 'react';
import { AchievementsPanel } from './AchievementsPanel';

interface AchievementsOverlayProps {
  open: boolean;
  onClose: () => void;
  achievements: Record<string, boolean>;
}

const AchievementsOverlay: React.FC<AchievementsOverlayProps> = ({ open, onClose, achievements }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50 lg:hidden" onClick={onClose}>
      <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
        <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={onClose}>✕</button>
        <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Achievements</h2>
        <AchievementsPanel achievements={achievements} />
      </div>
    </div>
  );
};

export default AchievementsOverlay; 