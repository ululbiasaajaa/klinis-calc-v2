import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AboutModal({ onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // EVENT LISTENER: TUTUP DENGAN TOMBOL ESCAPE
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      {/* Container Modal (mencegah event click bubbling ke backdrop) */}
      <div 
        className={`relative rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center border transition-all ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Silang (Close Top-Right) */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Tutup Modal"
        >
          ✕
        </button>

        {/* LOGO BADGE */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-extrabold shadow-inner ${
          isDark ? 'bg-blue-950 text-blue-400 border border-blue-800/50' : 'bg-blue-100 text-blue-600'
        }`}>
          Rx
        </div>

        {/* TITLE & VERSION */}
        <h3 id="about-modal-title" className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Clinical Suite v3
        </h3>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Aplikasi Kalkulator Klinis & Penunjang Medis
        </p>
        
        {/* DETAIL INFORMASI DEVELOPER */}
        <div className={`my-4 py-3 border-y text-left text-xs space-y-1.5 ${
          isDark ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
        }`}>
          <p className="flex justify-between">
            <span className="font-semibold">Developer:</span>
            <span className="font-medium text-blue-500">Muhammad Ulul Albab</span>
          </p>
          <p className="flex justify-between">
            <span className="font-semibold">Institusi:</span>
            <span>Universitas Pakuan</span>
          </p>
          <p className="flex justify-between">
            <span className="font-semibold">Lisensi:</span>
            <span className="font-mono text-[11px]">MIT License</span>
          </p>
        </div>

        {/* FOOTER COPYRIGHT */}
        <p className={`text-[10px] mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          © 2026 Clinical Suite. Hak cipta dilindungi undang-undang open-source.
        </p>

        {/* TOMBOL TUTUP UTAMA */}
        <button 
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}