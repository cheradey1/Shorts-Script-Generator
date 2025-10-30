import React, { useEffect } from 'react';
import { Trigger } from '../types';
import { getTriggerInfo } from '../locales/i18n';

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  trigger: Trigger | null;
  lang: string;
  t: any;
}

const TriggerModal: React.FC<TriggerModalProps> = ({ isOpen, onClose, onApply, trigger, lang, t }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !trigger) return null;

  const { name, description } = getTriggerInfo(lang, trigger);
  const handleApplyClick = () => {
    onApply();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trigger-modal-title"
    >
      <div
        className="bg-brand-surface rounded-xl border border-brand-muted p-6 w-full max-w-md mx-4 transform transition-all shadow-2xl scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s forwards' }}
      >
        <div className="flex justify-between items-center">
          <h3 id="trigger-modal-title" className="text-xl font-bold text-brand-text flex items-center gap-2">
             <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/40">{name}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-brand-text-dim hover:text-brand-text transition-colors rounded-full h-8 w-8 flex items-center justify-center bg-brand-bg hover:bg-brand-muted"
            aria-label="Close"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-4 text-brand-text-dim">{description}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-brand-muted text-brand-text-dim hover:bg-brand-muted/80 transition-colors"
          >
            {t.cancelButton}
          </button>
          <button
            onClick={handleApplyClick}
            className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-indigo-500 transition-colors"
          >
            {t.applyTriggerButton}
          </button>
        </div>
      </div>
       <style>{`
          @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scale-in 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
          }
        `}</style>
    </div>
  );
};

export default TriggerModal;