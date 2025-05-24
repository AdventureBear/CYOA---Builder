'use client';

import { useModalStore, ModalChoice } from '@/store/modalStore';
import { Button } from '@/components/ui/button';
import { handleModalChoice } from '@/engine/actionRunner';

export function MessageBox() {
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
    <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-amber-900/30 text-amber-100 p-4 rounded-lg">
      <h3 className="text-lg font-bold text-amber-200 font-runic mb-2">{currentModal.description}</h3>
      
      <div className="space-y-2">
        {currentModal.choices ? (
          currentModal.choices.map((choice: ModalChoice, index: number) => (
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
    </div>
  );
} 