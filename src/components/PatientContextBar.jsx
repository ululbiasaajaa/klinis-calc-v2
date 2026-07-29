import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatient } from '../context/PatientContext';

export function PatientContextBar({ onOpenDirectory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { 
    patientName, setPatientName, 
    patientId, setPatientId, 
    patientAge, setPatientAge,
    patientWeight, setPatientWeight,
    patientHeight, setPatientHeight,
    patientScr, setPatientScr,
    patientDiagnosis, setPatientDiagnosis
  } = usePatient();

  return (
    <div className={`p-4 rounded-2xl mb-6 border transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700/40">
        <div className="flex items-center gap-2">
          <span className="text-base">👤</span>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Quick Patient Summary (Active Context)
          </h3>
        </div>
        <button
          onClick={onOpenDirectory}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>📁</span> Pilih / Cari Pasien
        </button>
      </div>

      {/* GRID DATA PASIEN TERPUSAT */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        
        {/* NAMA PASIEN */}
        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">NAMA PASIEN</span>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nama Pasien"
            className="w-full bg-transparent font-bold outline-none text-xs truncate"
          />
        </div>

        {/* NO REKAM MEDIS */}
        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">NO. REKAM MEDIS</span>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="No. RM"
            className="w-full bg-transparent font-bold outline-none text-xs truncate font-mono"
          />
        </div>

        {/* USIA & GENDER */}
        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">USIA (TAHUN)</span>
          <input
            type="number"
            value={patientAge || ''}
            onChange={(e) => setPatientAge(e.target.value)}
            placeholder="Usia"
            className="w-full bg-transparent font-bold outline-none text-xs"
          />
        </div>

        {/* BERAT BADAN (BB) */}
        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">BERAT BADAN (KG)</span>
          <input
            type="number"
            value={patientWeight || ''}
            onChange={(e) => setPatientWeight(e.target.value)}
            placeholder="BB (kg)"
            className="w-full bg-transparent font-bold outline-none text-xs text-blue-500"
          />
        </div>

        {/* KREATININ SERUM (SCr) */}
        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">SERUM CREATININE</span>
          <input
            type="number"
            value={patientScr || ''}
            onChange={(e) => setPatientScr(e.target.value)}
            placeholder="SCr mg/dL"
            className="w-full bg-transparent font-bold outline-none text-xs text-amber-500"
          />
        </div>

        {/* DIAGNOSIS / RUANGAN */}
        <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">DIAGNOSIS / RUANGAN</span>
          <input
            type="text"
            value={patientDiagnosis || ''}
            onChange={(e) => setPatientDiagnosis(e.target.value)}
            placeholder="Diagnosis / ICU"
            className="w-full bg-transparent font-bold outline-none text-xs truncate"
          />
        </div>

      </div>
    </div>
  );
}

export default PatientContextBar;