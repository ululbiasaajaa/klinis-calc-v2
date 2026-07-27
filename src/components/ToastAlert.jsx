import React, { useEffect } from 'react';

export default function ToastAlert({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500); // Otomatis ilang dalam 3.5 detik
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-600 border-emerald-500 text-white',
    warning: 'bg-amber-600 border-amber-500 text-white',
    error: 'bg-red-600 border-red-500 text-white',
    info: 'bg-blue-600 border-blue-500 text-white'
  };

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '🚨',
    info: 'ℹ️'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-semibold ${bgColors[type] || bgColors.success}`}>
        <span className="text-base">{icons[type] || '✅'}</span>
        <span>{message}</span>
        <button onClick={onClose} className="ml-3 text-white/80 hover:text-white font-bold text-sm">✖</button>
      </div>
    </div>
  );
}