import React from 'react';
import { DiaryPanel } from './DiaryPanel';

interface JournalOverlayProps {
  open: boolean;
  onClose: () => void;
}

const JournalOverlay: React.FC<JournalOverlayProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50 lg:hidden" onClick={onClose}>
      <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
        <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={onClose}>✕</button>
        <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Journal</h2>
        <DiaryPanel />
        <div className="text-sm text-[#5a4632]">Story progress and notes...</div>
      </div>
    </div>
  );
};

export default JournalOverlay; 