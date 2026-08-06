import React, { useEffect } from 'react';

export default function ToastAlert({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500); // Otomatis menghilang dalam 3.5 detik
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600/95 border-emerald-500 text-white shadow-emerald-950/50',
    warning: 'bg-amber-600/95 border-amber-500 text-white shadow-amber-950/50',
    error: 'bg-red-600/95 border-red-500 text-white shadow-red-950/50',
    info: 'bg-blue-600/95 border-blue-500 text-white shadow-blue-950/50'
  };

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '🚨',
    info: 'ℹ️'
  };

  const isErrorOrWarning = type === 'error' || type === 'warning';

  return (
    <div 
      className="fixed bottom-28 right-6 z-[1000] animate-in fade-in slide-in-from-bottom-5 duration-300"
      role={isErrorOrWarning ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md text-xs font-semibold ${bgColors[type] || bgColors.success}`}>
        <span className="text-base" aria-hidden="true">{icons[type] || '✅'}</span>
        <span className="leading-snug">{message}</span>
        <button 
          type="button"
          onClick={onClose} 
          className="ml-3 text-white/70 hover:text-white font-bold text-sm cursor-pointer transition-colors"
          aria-label="Tutup Notifikasi"
        >
          ✖
        </button>
      </div>
    </div>
  );
}