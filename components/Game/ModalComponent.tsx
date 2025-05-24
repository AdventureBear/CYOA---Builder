'use client';
import { useModalStore } from '@/store/modalStore';
import { handleModalChoice } from '@/engine/actionRunner';

export function GameModal() {
  const modal = useModalStore((s) => s.current());

  if (!modal) return null; // no active popup

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#ece5db] text-[#3d2c1a] max-w-sm w-full p-6 rounded-xl shadow-lg border-2 border-[#bfae99]">
        <p className="mb-4 whitespace-pre-line text-base text-[#3d2c1a]">{modal.description}</p>

        {(modal.choices ?? []).length > 0 ? (
          (modal.choices ?? [{ text: 'Dismiss' }]).map((c, i) => (
            <button
              key={i}
              onClick={() => handleModalChoice(c)}
              className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left"
      
              style={{lineHeight: '1.1'}}
                    >
              {c.text}
            </button>
          ))
        ) : (
          <button
            onClick={() => handleModalChoice({ text: modal.buttonText || 'Dismiss' })}
            className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left mb-2 last:mb-0"
          >
            {modal.buttonText || 'Dismiss'}
          </button>
        )}
      </div>
    </div>
  );
}
