// components/Modal.tsx
import React from 'react';

export default function Modal({ open, children }: {
  open: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl p-6 min-w-[600px] shadow-2xl max-w-[1080px] w-[90%] min-h-[90vh] max-h-[90vh] overflow-y-auto flex flex-col">
        {children}
      </div>
    </div>
  );
}