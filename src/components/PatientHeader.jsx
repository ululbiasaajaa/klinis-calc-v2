import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PatientHeader({ patientName, setPatientName, patientId, setPatientId }) {
  const { t } = useLanguage();

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl mb-6 shadow-md">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <span>👤</span> {t.patientIdent}
        </h3>
        <span className="text-[10px] text-slate-400">Medical Record Input</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">{t.patientName}:</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder={t.patientPlaceholder}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">{t.medicalRecordNo}:</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder={t.rmPlaceholder}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}