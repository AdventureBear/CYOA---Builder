'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DeveloperSidebar, SlidingPanel } from '@/components/Dev/DeveloperSidebar';
import type { PanelType } from '@/components/Dev/DeveloperSidebar';
import { WandSparkles, BookOpen, Dice5 } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);
  const params = useParams();
  const { highlightHandlers } = useUiStore();

  // Ensure gameId is always a string, or null if not present
  const gameId = params ? (Array.isArray(params.game) ? params.game[0] : params.game) as string | null : null;

  const handlePanel = (panel: PanelType) => {
    // This logic ensures clicking the same icon toggles the panel off
    setOpenPanel(prev => (prev === panel ? null : panel));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="w-full bg-blue-900 h-10 text-white flex items-center px-4 gap-2" style={{ minHeight: 40 }}>
        <WandSparkles size={22} className="text-white" />
        <BookOpen size={22} className="text-white" />
        <Dice5 size={22} className="text-white" />
        <span className="font-bold text-lg tracking-wide ml-2">BYOCYOA</span>
        <span className="ml-2 text-xs opacity-70">Build Your Own Choose Your Own Adventure</span>
      </div>
      <div className="flex flex-1 min-h-0 h-[calc(100vh-40px)]">
        <DeveloperSidebar 
          onPanel={handlePanel} 
          activePanel={openPanel}
          onHighlightSceneGroup={highlightHandlers.onHighlightSceneGroup}
          onResetHighlight={highlightHandlers.onResetHighlight}
        />
        <SlidingPanel 
          openPanel={openPanel} 
          onClose={() => setOpenPanel(null)} 
          gameId={gameId}
          onHighlightSceneGroup={highlightHandlers.onHighlightSceneGroup}
          onResetHighlight={highlightHandlers.onResetHighlight}
        />
        <main className="flex-1 min-w-0 flex flex-col min-h-0 relative pl-16">
          {children}
        </main>
      </div>
    </div>
  );
} 