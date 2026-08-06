import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function SteroidConversionCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCHERS V3
  const { patient, addMedication, addLabRecord } = usePatientStore();

  // Tabel Equivalensi Steroid (Standar Referensi Klinis)
  // Dosis setara dengan 5 mg Prednison / Prednisolone
  const steroidDatabase = [
    { id: 'hydrocortisone', name: 'Hydrocortisone (Short-acting)', equivMg: 20, duration: '8 - 12 jam (Short)' },
    { id: 'cortisone', name: 'Cortisone', equivMg: 25, duration: '8 - 12 jam (Short)' },
    { id: 'prednisone', name: 'Prednisone (Intermediate)', equivMg: 5, duration: '12 - 36 jam (Intermediate)' },
    { id: 'prednisolone', name: 'Prednisolone (Intermediate)', equivMg: 5, duration: '12 - 36 jam (Intermediate)' },
    { id: 'methylprednisolone', name: 'Methylprednisolone (Intermediate)', equivMg: 4, duration: '12 - 36 jam (Intermediate)' },
    { id: 'triamcinolone', name: 'Triamcinolone', equivMg: 4, duration: '12 - 36 jam (Intermediate)' },
    { id: 'dexamethasone', name: 'Dexamethasone (Long-acting)', equivMg: 0.75, duration: '36 - 54 jam (Long)' },
    { id: 'betamethasone', name: 'Betamethasone (Long-acting)', equivMg: 0.6, duration: '36 - 54 jam (Long)' },
  ];

  const [fromSteroid, setFromSteroid] = useState('methylprednisolone');
  const [fromDose, setFromDose] = useState('16');
  const [targetSteroid, setTargetSteroid] = useState('dexamethasone');

  const sourceObj = steroidDatabase.find((s) => s.id === fromSteroid) || steroidDatabase[4];
  const targetObj = steroidDatabase.find((s) => s.id === targetSteroid) || steroidDatabase[6];

  // Hitung konversi: (Dosis Asal / Equivalen Asal) * Equivalen Target
  const calculateConversion = () => {
    const dose = parseFloat(fromDose) || 0;
    if (dose <= 0) return 0;
    
    // Konversi ke basis nilai setara Prednison dulu, lalu ke target
    const inPrednisoneEquivalent = dose * (5 / sourceObj.equivMg);
    const finalTargetDose = inPrednisoneEquivalent * (targetObj.equivMg / 5);

    return Number(finalTargetDose.toFixed(2));
  };

  const convertedDose = calculateConversion();

  // HANDLER AKSI V3 DISPATCHERS
  const handleAddToMedications = () => {
    addMedication({
      name: targetObj.name,
      dose: `${convertedDose} mg / hari (Konversi dari ${fromDose} mg ${sourceObj.name})`,
      category: 'Kortikosteroid Equipotent',
      source: `Durasi Kerja: ${targetObj.duration}`
    });
    alert(`✅ Dosis target steroid (${targetObj.name} ${convertedDose} mg) berhasil ditambahkan ke regimen obat aktif pasien!`);
  };

  const handleSaveToTracker = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Konversi Dosis Kortikosteroid',
      value: `${fromDose} mg ${sourceObj.name.split(' ')[0]} ➔ ${convertedDose} mg ${targetObj.name.split(' ')[0]}`,
      unit: 'mg/hari',
      source: 'Steroid Conversion Calculator v3'
    });
    alert(`✅ Rekam Konversi Steroid berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Evaluasi konversi dosis kortikosteroid.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STEROID ASAL */}
        <div>
          <label htmlFor="from-steroid-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Steroid Saat Ini (Asal):
          </label>
          <select
            id="from-steroid-select"
            value={fromSteroid}
            onChange={(e) => setFromSteroid(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            {steroidDatabase.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.equivMg} mg)</option>
            ))}
          </select>
        </div>

        {/* DOSIS ASAL */}
        <div>
          <label htmlFor="from-dose-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Dosis Asal (mg/hari):
          </label>
          <input
            id="from-dose-input"
            type="number"
            value={fromDose}
            onChange={(e) => setFromDose(e.target.value)}
            placeholder="e.g. 16"
            className={`w-full p-3 rounded-xl border outline-none font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* STEROID TUJUAN */}
        <div>
          <label htmlFor="target-steroid-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Target Steroid (Konversi):
          </label>
          <select
            id="target-steroid-select"
            value={targetSteroid}
            onChange={(e) => setTargetSteroid(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            {steroidDatabase.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.equivMg} mg)</option>
            ))}
          </select>
        </div>
      </div>

      {/* HASIL KONVERSI */}
      <div className={`p-5 rounded-2xl border text-center ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <span className="text-xs text-blue-500 font-bold block mb-1">
          HASIL DOSIS KONVERSI SETARA
        </span>
        <div className={`text-4xl font-extrabold my-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {convertedDose} <span className="text-sm font-normal text-blue-400">mg / hari</span>
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Setara secara anti-inflamasi dengan <strong>{fromDose || 0} mg {sourceObj.name.split(' ')[0]}</strong>
        </p>
      </div>

      {/* CATATAN KLINIS */}
      <div className={`p-4 rounded-xl border space-y-2 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          💡 Panduan Klinis Konversi Kortikosteroid:
        </p>
        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          • <strong>Potensi Anti-Inflamasi & Durasi:</strong> Deksametason memiliki potensi anti-inflamasi jauh lebih kuat (~7.5x dibanding Prednison) dengan durasi kerja panjang (Long-acting).<br />
          • <strong>Tappering Off:</strong> Penggunaan kortikosteroid jangka panjang (&gt;2 minggu) wajib diturunkan secara bertahap (*tappering off*) untuk menghindari insufisiensi adrenal sekunder.
        </p>
      </div>

      {/* AKSI SIMPAN DAN DISTRIBUSI KE STORE V3 */}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleSaveToTracker}
          className={`font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
          }`}
        >
          📈 Simpan Konversi ke Outcome Tracker
        </button>
        <button
          type="button"
          onClick={handleAddToMedications}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          💊 Tambahkan Dosis Steroid Target ke Regimen Aktif
        </button>
      </div>
    </div>
  );
}