'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (choiceText: string) => void;
}

export default function NewChoiceModal({ isOpen, onClose, onSubmit }: NewChoiceModalProps) {
  const [text, setText] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Create New Choice</h3>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter choice text..."
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </div>
      </div>
    </div>
  );
} 