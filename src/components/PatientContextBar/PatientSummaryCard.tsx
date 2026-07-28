import React from 'react';
import { usePatientStore } from '../../store/usePatientStore';

interface Props {
  onToggleEdit: () => void;
  isEditing: boolean;
}

export default function PatientSummaryCard({ onToggleEdit, isEditing }: Props) {
  const { patient, activeEncounter, resetPatient } = usePatientStore();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">👤</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm text-white">
              {patient.patientName ? patient.patientName : 'Belum Ada Pasien Aktif'}
            </h3>
            {patient.patientId && (
              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full font-mono">
                RM: {patient.patientId}
              </span>
            )}
            {activeEncounter && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                activeEncounter.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeEncounter.location} ({activeEncounter.status})
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {patient.patientName 
              ? `${patient.gender || '-'}, ${patient.age ? patient.age + ' thn' : '-'} | BB: ${patient.weightKg || '-'} kg | SCr: ${patient.serumCreatinine || '-'} mg/dL`
              : 'Silakan daftarkan atau pilih pasien untuk memulai workspace klinis.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={onToggleEdit}
          className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          {isEditing ? 'Tutup Panel' : patient.patientName ? 'Edit Data Pasien' : '+ Set Pasien Baru'}
        </button>
        {patient.patientName && (
          <button
            onClick={resetPatient}
            className="bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}