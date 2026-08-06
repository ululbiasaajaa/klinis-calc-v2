import React from 'react';
import { usePatientStore } from '../store/usePatientStore';
import { useTheme } from '../context/ThemeContext';

export default function PatientContextBar({ onOpenDirectory }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { patient, setPatientData, getClinicalContext, resetPatient } = usePatientStore();
  const { clcr, egfr, bmi, bsa } = getClinicalContext();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ [name]: value });
  };

  return (
    <div className={`p-4 md:p-5 rounded-2xl shadow-xl border transition-colors relative z-10 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      {/* Header Bar */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b pb-3 ${
        isDark ? 'border-slate-700/50' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">👤</span>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Shared Patient Context (Enterprise v3)
            </span>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Single Source of Truth untuk Seluruh Modul Kalkulator Klinis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={resetPatient}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title="Bersihkan Data Pasien Aktif"
          >
            🧹 Reset Pasien
          </button>

          <button
            type="button"
            onClick={onOpenDirectory}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all text-xs whitespace-nowrap cursor-pointer z-20 relative"
          >
            <span>📁</span> Pilih / Cari Pasien
          </button>
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 mb-3">
        <div className="col-span-2 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-name-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Nama Pasien
          </label>
          <input
            id="patient-name-ctx"
            type="text"
            name="patientName"
            value={patient.patientName || ''}
            onChange={handleInputChange}
            placeholder="Nama Pasien"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-id-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            No. RM
          </label>
          <input
            id="patient-id-ctx"
            type="text"
            name="patientId"
            value={patient.patientId || ''}
            onChange={handleInputChange}
            placeholder="No. RM"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-gender-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Gender
          </label>
          <select
            id="patient-gender-ctx"
            name="gender"
            value={patient.gender || 'Laki-laki'}
            onChange={handleInputChange}
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-age-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Usia (Thn)
          </label>
          <input
            id="patient-age-ctx"
            type="number"
            name="age"
            value={patient.age || ''}
            onChange={handleInputChange}
            placeholder="Usia"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-weight-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            BB (kg)
          </label>
          <input
            id="patient-weight-ctx"
            type="number"
            name="weightKg"
            value={patient.weightKg || ''}
            onChange={handleInputChange}
            placeholder="BB kg"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-height-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            TB (cm)
          </label>
          <input
            id="patient-height-ctx"
            type="number"
            name="heightCm"
            value={patient.heightCm || ''}
            onChange={handleInputChange}
            placeholder="TB cm"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-1">
          <label htmlFor="patient-scr-ctx" className={`block text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            SCr (mg/dL)
          </label>
          <input
            id="patient-scr-ctx"
            type="number"
            name="serumCreatinine"
            value={patient.serumCreatinine || ''}
            onChange={handleInputChange}
            placeholder="SCr"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>
      </div>

      {/* DIAGNOSIS & COMPUTED CONTEXT BADGES */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t items-center ${
        isDark ? 'border-slate-800/40' : 'border-slate-200'
      }`}>
        <div className="md:col-span-2">
          <label htmlFor="patient-diag-ctx" className="sr-only">Diagnosis Utama / Ruangan</label>
          <input
            id="patient-diag-ctx"
            type="text"
            name="primaryDiagnosis"
            value={patient.primaryDiagnosis || ''}
            onChange={handleInputChange}
            placeholder="Diagnosis Utama / Ruangan (cth: Sepsis Berat, ARDS Grade II / ICU Bed 04)"
            className={`w-full p-2 rounded-xl border outline-none text-xs font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className={`border px-2.5 py-1 rounded-lg text-center flex-1 ${
            isDark ? 'bg-blue-950/60 border-blue-800/60 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className={`text-[9px] block font-mono uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>eGFR</span>
            <strong>{egfr > 0 ? egfr : '-'}</strong>
          </div>
          <div className={`border px-2.5 py-1 rounded-lg text-center flex-1 ${
            isDark ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            <span className={`text-[9px] block font-mono uppercase ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>ClCr</span>
            <strong>{clcr > 0 ? clcr : '-'}</strong>
          </div>
          <div className={`border px-2.5 py-1 rounded-lg text-center flex-1 ${
            isDark ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className={`text-[9px] block font-mono uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>BMI</span>
            <strong>{bmi > 0 ? bmi : '-'}</strong>
          </div>
          <div className={`border px-2.5 py-1 rounded-lg text-center flex-1 ${
            isDark ? 'bg-amber-950/60 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className={`text-[9px] block font-mono uppercase ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>BSA</span>
            <strong>{bsa > 0 ? bsa : '-'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}