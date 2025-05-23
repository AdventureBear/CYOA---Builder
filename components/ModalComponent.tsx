'use client';
import { useModalStore } from '@/store/modalStore';
import { useGameStore }  from '@/store/gameStore';
import { runActions }    from '@/engine/actionRunner';

export function GameModal() {
  const modal = useModalStore((s) => s.current());
  const pop   = useModalStore((s) => s.pop);
  const gameState = useGameStore((s) => s.gameState);

  if (!modal) return null; // no active popup

  function handleClick(choice?: { nextAction?: string }) {
    pop();                                // close current modal
    if (choice?.nextAction) {
      runActions([choice.nextAction], 'onChoice', gameState);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#222] text-amber-100 max-w-sm w-full p-4 rounded shadow-lg border border-amber-900/40">
        <p className="mb-4 whitespace-pre-line">{modal.description}</p>

        {(modal.choices ?? [{ text: 'Dismiss' }]).map((c, i) => (
          <button
            key={i}
            onClick={() => handleClick(c)}
            className="w-full mb-2 last:mb-0 bg-amber-700 hover:bg-amber-600 text-sm py-1 rounded"
          >
            {c.text}
          </button>
        ))}
      </div>
    </div>
  );
}
