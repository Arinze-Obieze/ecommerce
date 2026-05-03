"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const contextValue = {
    showToast: (message, type) => addToast(message, type),
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container - Fixed Top Center */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
                pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border
                transform transition-all duration-300 animate-in slide-in-from-top-4 fade-in
                ${toast.type === 'success' ? 'bg-primary text-white border-primary' : ''}
                ${toast.type === 'error' ? 'bg-red-500 text-white border-red-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500 text-white border-blue-500' : ''}
                ${!['success', 'error', 'info'].includes(toast.type) ? 'bg-gray-800 text-white border-gray-700' : ''}
            `}
          >
            <div className="shrink-0 bg-white/20 p-1 rounded-full">
              {toast.type === 'success' && <FiCheck className="w-4 h-4" />}
              {toast.type === 'error' && <FiAlertTriangle className="w-4 h-4" />}
              {toast.type === 'info' && <FiInfo className="w-4 h-4" />}
            </div>
            
            <p className="flex-1 text-sm font-medium leading-none">{toast.message}</p>
            
            <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-1 transition-opacity"
            >
                <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
