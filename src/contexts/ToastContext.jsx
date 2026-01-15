import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', options = {}) => {
    const { duration = 3000, position = 'bottom-right' } = options;
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, position }]);

    if (duration !== 0 && duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getPositionClass = (position) => {
    switch (position) {
      case 'center':
        return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4';
      case 'top-center':
        return 'fixed top-10 left-1/2 -translate-x-1/2 flex flex-col gap-4';
      default:
        return 'fixed bottom-6 right-6 flex flex-col gap-3';
    }
  };

  const groupedToasts = toasts.reduce((acc, toast) => {
    const pos = toast.position || 'bottom-right';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(toast);
    return acc;
  }, {});

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {Object.entries(groupedToasts).map(([pos, posToasts]) => (
        <div key={pos} className={`${getPositionClass(pos)} z-[9999]`}>
          {posToasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-4 px-8 py-6 rounded-[2rem] shadow-2xl transition-all duration-500 scale-100 animate-in fade-in zoom-in-95 ${
                toast.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'
              } ${pos === 'center' ? 'min-w-[320px] border-2 border-brand-orange/50' : ''}`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className={`w-6 h-6 text-green-400 ${pos === 'center' ? 'w-8 h-8' : ''}`} />
              ) : (
                <XCircle className={`w-6 h-6 text-red-200 ${pos === 'center' ? 'w-8 h-8' : ''}`} />
              )}
              <div className="flex-1">
                <p className={`${pos === 'center' ? 'text-lg' : 'text-sm'} font-bold tracking-wide`}>{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
