import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SteroidConversionCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STEROID ASAL */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Steroid Saat Ini (Asal):' : 'Current Steroid:'}
          </label>
          <select
            value={fromSteroid}
            onChange={(e) => setFromSteroid(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
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
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Dosis Asal (mg/hari):' : 'Current Dose (mg/day):'}
          </label>
          <input
            type="number"
            value={fromDose}
            onChange={(e) => setFromDose(e.target.value)}
            placeholder="e.g. 16"
            className={`w-full p-3 rounded-xl border outline-none text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* STEROID TUJUAN */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Target Steroid (Konversi):' : 'Target Steroid:'}
          </label>
          <select
            value={targetSteroid}
            onChange={(e) => setTargetSteroid(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
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
          {lang === 'id' ? 'HASIL DOSIS KONVERSI SETARA' : 'EQUIVALENT CONVERTED DOSE'}
        </span>
        <div className={`text-4xl font-extrabold my-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {convertedDose} <span className="text-sm font-normal text-blue-400">mg / hari</span>
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Setara secara anti-inflamasi dengan <strong>{fromDose || 0} mg {sourceObj.name.split(' ')[0]}</strong>
        </p>
      </div>

      {/* CATATAN KLINIS */}
      <div className={`p-4 rounded-xl border text-xs space-y-2 ${
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
    </div>
  );
}