import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onHide, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-stone-800 text-white text-sm font-medium shadow-lg transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <CheckCircle size={16} className="text-emerald-400 shrink-0" />
      {message}
    </div>
  );
}
