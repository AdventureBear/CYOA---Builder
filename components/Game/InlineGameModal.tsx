import { handleModalChoice } from "@/engine/actionRunner";
import { ModalChoice } from "@/store/modalStore";

import { useModalStore } from "@/store/modalStore";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { ChoiceComponent } from "./Choice";
import { useGameStore } from "@/store/gameStore";

function InlineGameModal() {
    const currentModal = useModalStore((state) => state.current());
    const pop = useModalStore((state) => state.pop);
    const lastChoice = useGameStore((state) => state.lastChoice);
    const choiceStack = useGameStore((state) => state.choiceStack);
    const pushChoice = useGameStore((state) => state.pushChoice);
    const popChoice = useGameStore((state) => state.popChoice);
  
    useEffect(() => {
        console.log('InlineGameModal rendered');
      }, []);
      
    if (!currentModal) return null;
  
    const handleChoice = (choice: ModalChoice) => {
      pushChoice(choice.text);
      handleModalChoice(choice);
    };
  
    const handleDismiss = () => {
      popChoice();
      pop();
    };
  
    return (
      <>
        {/* Action description OUTSIDE the panel, below breadcrumbs */}
        <div className="text-base text-[#3d2c1a] font-normal mb-2 px-1 font-runic">
          {currentModal.description}
        </div>
        {/* Light panel for action choices */}
        <div className="bg-[#f5eee5] rounded-xl shadow-sm p-3 w-full flex flex-col gap-2">
          <div className="text-xs text-[#bfae99] font-semibold mb-1">What do you do?</div>
          {currentModal.choices ? (
            currentModal.choices.map((choice, index) => (
              <ChoiceComponent
                key={index}
                choice={choice}
                onChoice={handleChoice}
              />
            ))
          ) : (
            <Button
              onClick={handleDismiss}
              className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left"
              variant="ghost"
            >
              Continue
            </Button>
          )}
        </div>
      </>
    );
  }

export default InlineGameModal;