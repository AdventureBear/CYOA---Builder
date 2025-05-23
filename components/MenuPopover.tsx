import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface MenuPopoverProps {
  onNewGame: () => void;
}

export function MenuPopover({ onNewGame }: MenuPopoverProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 right-4 z-50 bg-[#ece5db]/80 border border-[#bfae99] rounded-full p-3 shadow-lg hover:bg-[#e0d3b8] transition"
        aria-label="Open menu"
      >
        <span className="text-2xl">⚙️</span>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed top-16 right-4 z-50 bg-[#f5f3ed] border border-[#bfae99] rounded-xl shadow-lg p-4 flex flex-col gap-2 min-w-[180px]"
        >
          <Link
            href="/developer"
            className="block px-4 py-2 rounded hover:bg-[#e0d3b8] text-[#5a4632] font-semibold text-lg text-left"
            onClick={() => setOpen(false)}
          >
            Developer Dashboard
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onNewGame();
            }}
            className="block w-full px-4 py-2 rounded hover:bg-[#e0d3b8] text-[#5a4632] font-semibold text-lg text-left"
          >
            New Game
          </button>
        </div>
      )}
    </>
  );
} 