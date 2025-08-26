import type {ReactNode} from 'react';

export default function Modal({open, onClose, children}:{open:boolean; onClose:()=>void; children:ReactNode;}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg min-w-[300px]">
        {children}
        <button onClick={onClose} className="mt-4 text-sm text-red-600">Close</button>
      </div>
    </div>
  );
}
