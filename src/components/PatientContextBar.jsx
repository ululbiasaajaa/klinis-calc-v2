import React from 'react';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';

export default function PatientContextBar({ onOpenDirectory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { patientName, setPatientName, patientId, setPatientId } = usePatient();

  return (
    <div className={`p-4 md:p-5 rounded-2xl shadow-xl border transition-colors relative z-10 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b pb-3 border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">👤</span>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Quick Patient Summary (Active Context)
          </span>
        </div>

        {/* TOMBOL DIREKTORI UTAMA - DIJAMIN KLIK-ABLE */}
        <button
          type="button"
          onClick={onOpenDirectory}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs whitespace-nowrap cursor-pointer z-20 relative"
        >
          <span>📁</span> Pilih / Cari Pasien
        </button>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Pasien</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nama Pasien"
            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">No. Rekam Medis</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="No. RM"
            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Usia (Tahun)</label>
          <input
            type="number"
            placeholder="Usia"
            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Berat Badan (kg)</label>
          <input
            type="number"
            placeholder="BB (kg)"
            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serum Creatinine</label>
          <input
            type="number"
            placeholder="SCr mg/dL"
            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Diagnosis / Ruangan</label>
          <input
            type="text"
            placeholder="Diagnosis / ICU"
            className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>
      </div>
    </div>
  );
}