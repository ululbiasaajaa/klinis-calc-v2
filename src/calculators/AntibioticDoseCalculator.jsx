import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AntibioticDoseCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State Input Pasien & Pemilihan Antibiotik
  const [antibiotic, setAntibiotic] = useState('meropenem');
  const [clcrInput, setClcrInput] = useState('65'); // ml/min

  // Database Dosis & Penyesuaian Berdasarkan Fungsi Ginjal (ClCr)
  const antibioticDatabase = {
    meropenem: {
      name: 'Meropenem (Injeksi IV)',
      standardDose: '1g setiap 8 jam (Infus standar)',
      adjustments: [
        { minClcr: 50, maxClcr: 999, dose: '1 g setiap 8 jam', note: 'Fungsi ginjal normal / sedikit turun. Dosis standar.' },
        { minClcr: 26, maxClcr: 49, dose: '1 g setiap 12 jam', note: 'Penyesuaian moderat.' },
        { minClcr: 10, maxClcr: 25, dose: '500 mg setiap 12 jam', note: 'Penyesuaian berat.' },
        { minClcr: 0, maxClcr: 9, dose: '500 mg setiap 24 jam', note: 'Gagal ginjal berat / Hemodialisis (berikan setelah HD).' }
      ]
    },
    levofloxacin: {
      name: 'Levofloxacin (Oral / IV)',
      standardDose: '500 mg atau 750 mg setiap 24 jam',
      adjustments: [
        { minClcr: 50, maxClcr: 999, dose: '500 mg / 24 jam (atau 750 mg/48 jam)', note: 'Fungsi ginjal normal.' },
        { minClcr: 20, maxClcr: 49, dose: 'Dosis awal 500 mg, lalu 250 mg / 24 jam (atau 500 mg/48 jam)', note: 'Penyesuaian ClCr 20-49 mL/min.' },
        { minClcr: 0, maxClcr: 19, dose: 'Dosis awal 500 mg, lalu 250 mg / 48 jam (atau 250 mg/24 jam untuk 750mg)', note: 'Penyesuaian berat / Hemodialisis.' }
      ]
    },
    cefepime: {
      name: 'Cefepime (Injeksi IV)',
      standardDose: '1g - 2g setiap 8-12 jam',
      adjustments: [
        { minClcr: 50, maxClcr: 999, dose: '2 g setiap 8 jam (Kasus berat)', note: 'Dosis normal.' },
        { minClcr: 30, maxClcr: 49, dose: '2 g setiap 12 jam', note: 'Turunkan frekuensi / dosis.' },
        { minClcr: 11, maxClcr: 29, dose: '2 g setiap 24 jam', note: 'Penyesuaian berat.' },
        { minClcr: 0, maxClcr: 10, dose: '500 mg setiap 24 jam', note: 'Gagal ginjal terminal / HD.' }
      ]
    },
    piperacillin_tazobactam: {
      name: 'Piperacillin / Tazobactam (Zosyn)',
      standardDose: '4.5 g setiap 6 jam',
      adjustments: [
        { minClcr: 50, maxClcr: 999, dose: '4.5 g setiap 6 jam', note: 'Dosis standar infeksi berat.' },
        { minClcr: 20, maxClcr: 49, dose: '3.375 g setiap 6 jam (atau 4.5g / 8 jam)', note: 'Penyesuaian moderat.' },
        { minClcr: 0, maxClcr: 19, dose: '2.25 g setiap 6 jam (atau 3.375g / 12 jam)', note: 'Penyesuaian gagal ginjal / HD.' }
      ]
    },
    vancomycin: {
      name: 'Vancomycin (Infus IV - Berdasarkan TDM/ClCr)',
      standardDose: '15 - 20 mg/kg setiap 8-12 jam',
      adjustments: [
        { minClcr: 50, maxClcr: 999, dose: '15-20 mg/kg tiap 8-12 jam', note: 'Pantau kadar Trough / AUC.' },
        { minClcr: 10, maxClcr: 49, dose: '15-20 mg/kg tiap 24-48 jam', note: 'Perpanjang interval berdasarkan kadar serum kreatinin.' },
        { minClcr: 0, maxClcr: 9, dose: '15-20 mg/kg dosis muatan (loading), lalu sesuaikan dengan TDM', note: 'Pasien HD (dosis pemeliharaan pasca cuci darah).' }
      ]
    }
  };

  const selectedAbx = antibioticDatabase[antibiotic];
  const clcrVal = parseFloat(clcrInput) || 0;

  // Mencari rekomendasi dosis yang sesuai dengan rentang ClCr pasien
  const currentRecommendation = selectedAbx.adjustments.find(
    (item) => clcrVal >= item.minClcr && clcrVal <= item.maxClcr
  ) || selectedAbx.adjustments[selectedAbx.adjustments.length - 1];

  return (
    <div className="space-y-6 text-xs">
      
      {/* HEADER INFORMASI */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🦠 Kalkulator & Penyesuaian Dosis Antibiotik (Ginjal)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menentukan rekomendasi penyesuaian dosis obat antimikroba berdasarkan Klirens Kreatinin (ClCr) pasien untuk mencegah toksisitas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Pilih Antibiotik</label>
            <select
              value={antibiotic}
              onChange={(e) => setAntibiotic(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              {Object.keys(antibioticDatabase).map((key) => (
                <option key={key} value={key}>{antibioticDatabase[key].name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Klirens Kreatinin Pasien (ClCr mL/min)</label>
            <input
              type="number"
              value={clcrInput}
              onChange={(e) => setClcrInput(e.target.value)}
              placeholder="e.g. 45"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>
        </div>
      </div>

      {/* HASIL REKOMENDASI DOSIS */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 border-blue-500/20">
          <div>
            <span className="text-[10px] text-blue-500 font-bold uppercase">Evaluasi Regimen</span>
            <h4 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedAbx.name}</h4>
          </div>
          <div className="px-3 py-1.5 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-500 font-bold text-xs">
            Dosis Standar: {selectedAbx.standardDose}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">REKOMENDASI DOSIS BERDASARKAN ClCr ({clcrVal} mL/min):</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{currentRecommendation.dose}</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] text-amber-500 font-bold block mb-1">⚠️ Catatan Klinis & Penyesuaian:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{currentRecommendation.note}</p>
          </div>
        </div>
      </div>

    </div>
  );
}