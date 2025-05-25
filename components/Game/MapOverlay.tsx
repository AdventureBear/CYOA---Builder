import React from 'react';

interface MapOverlayProps {
  open: boolean;
  onClose: () => void;
}

const MapOverlay: React.FC<MapOverlayProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50" onClick={onClose}>
      <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2 flex flex-col items-center" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
        <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={onClose}>✕</button>
        <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Map</h2>
        <div className="mt-4 mb-4 w-3/4 aspect-square bg-gray-700 flex items-center justify-center rounded-lg">
          <span className="text-white/80">[ Map Placeholder ]</span>
        </div>
      </div>
    </div>
  );
};

export default MapOverlay; 