import { handleModalChoice } from "@/engine/actionRunner";
import { ModalChoice } from "@/store/modalStore";

import { useModalStore } from "@/store/modalStore";
import { Button } from "../ui/button";
import { useEffect } from "react";

function InlineGameModal() {
    const currentModal = useModalStore((state) => state.current());
    const pop = useModalStore((state) => state.pop);
  
    useEffect(() => {
        console.log('InlineGameModal rendered');
      }, []);
      
    if (!currentModal) return null;
  
    const handleChoice = (choice: ModalChoice) => {
      handleModalChoice(choice);
    };
  
    const handleDismiss = () => {
      pop();
    };
  
    return (
        
        <div className="px-4 py-3 my-4 space-y-2">
      <div className="font-runic  mb-2">{currentModal.description}</div>
        
      <div className="flex flex-col gap-2 px-4 py-2 flex-1 overflow-y-auto">
          {currentModal.choices ? (
            currentModal.choices.map((choice, index) => (
        
              <Button
              key={index}
              onClick={() => handleChoice(choice)}
              className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left"
              style={{lineHeight: '1.1'}}
               variant="ghost"
    >
      <div className="flex items-center space-x-3">
        <span className=" font-runic text-lg">{choice.text}</span>
      </div>
    </Button>


            ))
          ) : (
            <Button
              onClick={handleDismiss}
              className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left"
              variant="ghost"            >
              Continue
            </Button>
          )}
        </div>
      </div>
    );
  }

export default InlineGameModal;