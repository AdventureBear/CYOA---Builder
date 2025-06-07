import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
        onClick={onClose}
    >
      <div 
        className="p-6 bg-white rounded-lg shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
} 