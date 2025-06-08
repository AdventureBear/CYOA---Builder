'use client';

import React, { useState, useEffect } from 'react';

interface NewChoiceModalProps {
  onConfirm: (choiceText: string) => void;
  onCancel: () => void;
}

export default function NewChoiceModal({ onConfirm, onCancel }: NewChoiceModalProps) {
  const [choiceText, setChoiceText] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!choiceText.trim()) return;
    onConfirm(choiceText);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-96 border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-medium mb-3">Add Choice</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={choiceText}
            onChange={(e) => setChoiceText(e.target.value)}
            placeholder="Enter choice text..."
            className="w-full px-4 py-2 border rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!choiceText.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add Choice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 