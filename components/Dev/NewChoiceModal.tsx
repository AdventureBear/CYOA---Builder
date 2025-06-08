'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface NewChoiceModalProps {
  onConfirm: (choiceText: string) => void;
  onCancel: () => void;
}

export default function NewChoiceModal({ onConfirm, onCancel }: NewChoiceModalProps) {
  const [choiceText, setChoiceText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!choiceText.trim()) return;
    onConfirm(choiceText);
  };

  return (
    <Modal open={true}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">Enter Choice Text</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={choiceText}
            onChange={(e) => setChoiceText(e.target.value)}
            placeholder="Enter the text for this choice..."
            className="w-full p-2 border rounded mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!choiceText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Create Choice
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 