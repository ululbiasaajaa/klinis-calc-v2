import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/usePatientStore';

export default function PatientNotesWidget({ onSaveNote }) {
  // BACA DARI SINGLE SOURCE OF TRUTH (STORE V3)
  const { patient, getClinicalContext } = usePatientStore();
  const patientName = patient.patientName || 'Pasien Umum';
  const patientId = patient.patientId || '-';
  const { egfr } = getClinicalContext();

  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Key storage tersinkronisasi No RM
  const storageKey = `clinical_suite_notes_v3_${patientId}`;

  useEffect(() => {
    const savedNote = localStorage.getItem(storageKey);
    setNote(savedNote || '');
  }, [storageKey, patientId]);

  const handleSave = () => {
    localStorage.setItem(storageKey, note);
    if (onSaveNote) onSaveNote(note);
    setIsOpen(false);
  };

  // Helper Template Otomatis SBAR/SOAP
  const applyTemplate = (type) => {
    const dateStr = new Date().toLocaleString('id-ID');
    if (type === 'SBAR') {
      const sbarText = `[SBAR - ${dateStr}]\nS (Situation): Pasien ${patientName} (RM: ${patientId}). Dx: ${patient.primaryDiagnosis || '-'}\nB (Background): Usia ${patient.age || '-'} thn, BB ${patient.weightKg || '-'} kg. eGFR: ${egfr || '-'} mL/min.\nA (Assessment): Evaluasi respon terapi & fungsi ginjal.\nR (Recommendation): Lanjutkan terapi & re-evaluasi besok.`;
      setNote(sbarText);
    } else if (type === 'SOAP') {
      const soapText = `[SOAP - ${dateStr}]\nS: Keluhan utama...\nO: TD: - | HR: - | SCr: ${patient.serumCreatinine || '-'} mg/dL | eGFR: ${egfr || '-'}\nA: ${patient.primaryDiagnosis || 'Asesmen klinis'}\nP: Lanjutkan regimen obat & pemantauan lab.`;
      setNote(soapText);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-4 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all transform hover:scale-110 animate-bounce border-2 border-white/20 cursor-pointer"
          title="Catatan Visite / Clinical Notes"
        >
          📝
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl w-80 sm:w-88 shadow-2xl text-slate-100 transform transition-all translate-y-0 opacity-100">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-blue-400">
                <span>📝</span> Catatan Visite (v3)
              </h4>
              <span className="text-[10px] text-slate-400 block">
                {patientName} (RM: {patientId})
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg leading-none cursor-pointer">✖</button>
          </div>

          {/* TEMPLATE QUICK BUTTONS */}
          <div className="flex gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => applyTemplate('SBAR')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600/30 text-blue-300 font-bold text-[9px] border border-slate-700 transition-all cursor-pointer"
            >
              + Template SBAR
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('SOAP')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 font-bold text-[9px] border border-slate-700 transition-all cursor-pointer"
            >
              + Template SOAP
            </button>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tulis instruksi dokter atau catatan klinis SBAR/SOAP di sini..."
            className="w-full h-36 bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500 resize-none mb-3 shadow-inner"
          />

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
          >
            Simpan Catatan Pasien
          </button>
        </div>
      )}
    </div>
  );
}