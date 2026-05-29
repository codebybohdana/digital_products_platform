import { useEffect } from "react";
import { Link } from "react-router-dom";

interface ToastProps {
  message: string;
  linkText?: string;
  linkTo?: string;
  onClose: () => void;
}

export default function Toast({ message, linkText, linkTo, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 whitespace-nowrap">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span className="text-sm font-medium">{message}</span>
      {linkText && linkTo && (
        <Link to={linkTo} onClick={onClose} className="text-sm underline opacity-80 hover:opacity-100">
          {linkText}
        </Link>
      )}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
