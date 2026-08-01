import React from 'react';

export default function AboutModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
          Rx
        </div>
        <h3 className="text-xl font-bold text-gray-800">Clinical Suite v2</h3>
        <p className="text-xs text-gray-500 mt-1">Aplikasi Kalkulator Klinis & Penunjang Medis</p>
        
        <div className="my-4 py-3 border-t border-b border-gray-100 text-left text-xs text-gray-600 space-y-1">
          <p><span className="font-semibold">Developer:</span> Muhammad Ulul Albab</p>
          <p><span className="font-semibold">Institusi:</span> Universitas Pakuan</p>
          <p><span className="font-semibold">Lisensi:</span> MIT License</p>
        </div>

        <p className="text-[10px] text-gray-400 mb-4">
          © 2026 Clinical Suite. Hak cipta dilindungi undang-undang open-source.
        </p>

        <button 
          onClick={onClose}
          className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}