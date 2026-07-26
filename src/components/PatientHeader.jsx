import React from 'react';

export default function PatientHeader({ patientName, setPatientName, patientId, setPatientId }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">👤</span>
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Identitas Pasien (Input Laporan PDF)
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Nama Pasien (Misal: Tn. Muhammad Ulul)"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
        />
        <input
          type="text"
          placeholder="No. Rekam Medis / RM (Misal: 25)"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
        />
      </div>
    </div>
  );
}