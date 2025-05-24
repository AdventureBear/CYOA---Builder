'use client';

import { useModalStore, ModalChoice } from '@/store/modalStore';
import { handleModalChoice } from '@/engine/actionRunner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';

function GameModalContent() {
  const currentModal = useModalStore((state) => state.current());
  const pop = useModalStore((state) => state.pop);

  if (!currentModal) return null;

  const handleChoice = (choice: ModalChoice) => {
    handleModalChoice(choice);
  };

  const handleDismiss = () => {
    pop();
  };

  return (
    <Dialog 
      open={!!currentModal} 
      onOpenChange={(open) => {
        if (!open) handleDismiss();
      }}
    >
      <DialogContent className="bg-[#1a1a1a]/80 backdrop-blur-sm border-amber-900/30 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-200 font-runic">{currentModal.description}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-2">
          {currentModal.choices ? (
            currentModal.choices.map((choice, index) => (
              <Button
                key={index}
                onClick={() => handleChoice(choice)}
                className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-900/30"
              >
                {choice.text}
              </Button>
            ))
          ) : (
            <Button
              onClick={handleDismiss}
              className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-900/30"
            >
              Continue
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a client-only version of the component
export const GameModal = dynamic(() => Promise.resolve(GameModalContent), {
  ssr: false
}); 