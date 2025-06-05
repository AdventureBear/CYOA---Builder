'use client';

import { useState } from 'react';
import { DeveloperSidebar, SlidingPanel } from '@/components/Dev/DeveloperSidebar';
import type { PanelType } from '@/components/Dev/DeveloperSidebar';
import { WandSparkles, BookOpen, Dice5 } from 'lucide-react';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const [openPanel, setOpenPanel] = useState<PanelType>(null);

  // Custom handler to toggle the scene panel
  const handlePanel = (panel: PanelType) => {
    if (panel === 'scene') {
      setOpenPanel(prev => (prev === 'scene' ? null : 'scene'));
    } else {
      setOpenPanel(panel);
    }
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
        <DeveloperSidebar onPanel={handlePanel} />
        <SlidingPanel openPanel={openPanel} onClose={() => setOpenPanel(null)} />
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
} 