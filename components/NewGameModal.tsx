'use client';

import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewGameModal({ isOpen, onClose }: NewGameModalProps) {
  const router = useRouter();
  const { resetGame, saveGame } = useGameStore();

  const handleNewGame = () => {
    resetGame();
    onClose();
    router.push('/scene/village_gathering');
  };

  const handleSaveAndNew = () => {
    const saveKey = saveGame();
    resetGame();
    onClose();
    router.push('/scene/village_gathering');
    // You could show a toast or notification with the save key here
    alert(`Game saved as: ${saveKey}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a]/80 backdrop-blur-sm border-amber-900/30 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-200 font-runic">Start New Game?</DialogTitle>
          <DialogDescription className="text-amber-100/80">
            Are you sure you want to start a new game? You&apos;ll lose all your current progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-2">
          <Button
            onClick={handleNewGame}
            className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-900/30"
          >
            Start New Game
          </Button>
          <Button
            onClick={handleSaveAndNew}
            className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-900/30"
          >
            Save Current Game & Start New
          </Button>
          <Button
            onClick={onClose}
            className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-amber-100 border border-gray-700/30"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 