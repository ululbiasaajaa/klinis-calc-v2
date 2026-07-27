import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext';

export default function PatientNotesWidget({ onSaveNote }) {
  const { patientId, patientName } = usePatient();
  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Key localStorage unik berdasarkan No. RM pasien aktif
  const storageKey = `clinical_suite_notes_${patientId || 'general'}`;

  useEffect(() => {
    const savedNote = localStorage.getItem(storageKey);
    setNote(savedNote || '');
  }, [storageKey, patientId]); // update trigger kalau pasien ganti

  const handleSave = () => {
    localStorage.setItem(storageKey, note);
    if (onSaveNote) onSaveNote(note);
    setIsOpen(false); // Otomatis nutup pas di-save biar rapi
  };

  return (
    // POSISI DIGANTI: Kanan bawah (bottom-24 biar di atas Toast), z-index 999 max
    <div className="fixed bottom-24 right-6 z-[999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-4 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all transform hover:scale-110 animate-bounce border-2 border-white/20"
          title="Catatan Visite / Clinical Notes"
        >
          📝
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-2xl w-80 shadow-2xl text-slate-100 transform transition-all translate-y-0 opacity-100">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-blue-400">
              <span>📝</span> Catatan Visite ({patientName || 'Pasien Umum'})
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg leading-none">✖</button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tulis instruksi dokter atau catatan klinis di sini..."
            className="w-full h-32 bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500 resize-none mb-3 shadow-inner"
          />
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            Simpan Catatan
          </button>
        </div>
      )}
    </div>
  );
}