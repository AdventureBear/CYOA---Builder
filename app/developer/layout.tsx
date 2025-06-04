import { DeveloperSidebarsWrapper } from '@/components/Dev/DeveloperSidebar';
import { WandSparkles, BookOpen, Dice5 } from 'lucide-react';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full bg-blue-900 h-10 text-white flex items-center px-4 gap-2" style={{ minHeight: 40 }}>
        <WandSparkles size={22} className="text-white" />
        <BookOpen size={22} className="text-white" />
        <Dice5 size={22} className="text-white" />
        <span className="font-bold text-lg tracking-wide ml-2">BYOCYOA</span>
        <span className="ml-2 text-xs opacity-70">Build Your Own Choose Your Own Adventure</span>
      </div>
      <div className="flex h-[calc(100vh-40px)]">
        <DeveloperSidebarsWrapper>
          {children}
        </DeveloperSidebarsWrapper>
      </div>
    </div>
  );
} 