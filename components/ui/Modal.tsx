import React, { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * Modal dialog component providing keyboard navigation and ARIA roles.
 *
 * @param isOpen Controls visibility of the modal.
 * @param title Title displayed at the top of the modal.
 * @param onClose Callback invoked when the modal requests to close.
 * @param children Modal body content.
 */
export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && ref.current) ref.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={ref}
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md outline-none"
      >
        <h2 id="modal-title" className="text-xl mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <div className="text-gray-700 dark:text-gray-200">{children}</div>
        <div className="mt-6 text-right">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
