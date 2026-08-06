import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePatientStore } from '../../store/usePatientStore';

interface Props {
  onToggleEdit: () => void;
  isEditing: boolean;
}

export default function PatientSummaryCard({ onToggleEdit, isEditing }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { patient, activeEncounter, resetPatient } = usePatientStore();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">👤</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {patient.patientName ? patient.patientName : 'Belum Ada Pasien Aktif'}
            </h3>
            {patient.patientId && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                isDark 
                  ? 'bg-blue-950 text-blue-400 border-blue-800' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                RM: {patient.patientId}
              </span>
            )}
            {activeEncounter && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                activeEncounter.status === 'ACTIVE' 
                  ? isDark 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isDark 
                    ? 'bg-slate-800 text-slate-400 border-slate-700' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {activeEncounter.location} ({activeEncounter.status})
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {patient.patientName 
              ? `${patient.gender || '-'}, ${patient.age ? patient.age + ' thn' : '-'} | BB: ${patient.weightKg || '-'} kg | SCr: ${patient.serumCreatinine || '-'} mg/dL`
              : 'Silakan daftarkan atau pilih pasien untuk memulai workspace klinis.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          type="button"
          onClick={onToggleEdit}
          className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          {isEditing ? 'Tutup Panel' : patient.patientName ? 'Edit Data Pasien' : '+ Set Pasien Baru'}
        </button>
        {patient.patientName && (
          <button
            type="button"
            onClick={resetPatient}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isDark 
                ? 'bg-red-950/40 hover:bg-red-900/50 text-red-400 border-red-900/50' 
                : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
            }`}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}