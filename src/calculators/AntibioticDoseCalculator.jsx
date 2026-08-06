import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

// Database Dosis & Penyesuaian Berdasarkan Fungsi Ginjal (ClCr)
// Dipindahkan ke luar komponen untuk mencegah re-allocation pada setiap render
const ANTIBIOTIC_DATABASE = {
  meropenem: {
    name: 'Meropenem (Injeksi IV)',
    standardDose: '1 g setiap 8 jam (Infus standar)',
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
      { minClcr: 50, maxClcr: 999, dose: '500 mg / 24 jam (atau 750 mg / 48 jam)', note: 'Fungsi ginjal normal.' },
      { minClcr: 20, maxClcr: 49, dose: 'Dosis awal 500 mg, lalu 250 mg / 24 jam', note: 'Penyesuaian ClCr 20-49 mL/min.' },
      { minClcr: 0, maxClcr: 19, dose: 'Dosis awal 500 mg, lalu 250 mg / 48 jam', note: 'Penyesuaian berat / Hemodialisis.' }
    ]
  },
  cefepime: {
    name: 'Cefepime (Injeksi IV)',
    standardDose: '1 g - 2 g setiap 8-12 jam',
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
      { minClcr: 20, maxClcr: 49, dose: '3.375 g setiap 6 jam (atau 4.5 g / 8 jam)', note: 'Penyesuaian moderat.' },
      { minClcr: 0, maxClcr: 19, dose: '2.25 g setiap 6 jam (atau 3.375 g / 12 jam)', note: 'Penyesuaian gagal ginjal / HD.' }
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
  },
  ciprofloxacin: {
    name: 'Ciprofloxacin (Oral / IV)',
    standardDose: '400 mg IV / 500 mg Oral tiap 12 jam',
    adjustments: [
      { minClcr: 50, maxClcr: 999, dose: '400 mg IV / 500 mg Oral tiap 12 jam', note: 'Dosis standar.' },
      { minClcr: 30, maxClcr: 49.9, dose: '200-400 mg IV / 250-500 mg Oral tiap 12 jam', note: 'Penyesuaian dosis ringan-sedang.' },
      { minClcr: 0, maxClcr: 29.9, dose: '200-400 mg IV / 250-500 mg Oral tiap 18-24 jam', note: 'Penyesuaian berat.' }
    ]
  },
  fluconazole: {
    name: 'Fluconazole (Oral / IV)',
    standardDose: '200 - 400 mg setiap 24 jam',
    adjustments: [
      { minClcr: 50, maxClcr: 999, dose: '200 - 400 mg tiap 24 jam', note: 'Dosis standar (100%).' },
      { minClcr: 0, maxClcr: 49, dose: '50% dari dosis standar (misal: 100-200 mg) tiap 24 jam', note: 'Reduksi 50% dosis harian.' }
    ]
  }
};

export default function AntibioticDoseCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL PASIEN & COMPUTED CLINICAL CONTEXT LANGSUNG DARI STORE V3
  const { patient, getClinicalContext, addMedication } = usePatientStore();
  const { clcr } = getClinicalContext();

  // State Input Pasien & Pemilihan Antibiotik
  const [antibiotic, setAntibiotic] = useState('meropenem');
  const [clcrInput, setClcrInput] = useState('65'); // ml/min

  // Auto-sync ClCr secara real-time dari Computed Context v3
  useEffect(() => {
    if (clcr > 0) {
      setClcrInput(clcr.toString());
    }
  }, [clcr]);

  const selectedAbx = ANTIBIOTIC_DATABASE[antibiotic] || ANTIBIOTIC_DATABASE.meropenem;
  
  // Memastikan nilai numerik ter-parse dengan aman
  const parsedClcr = parseFloat(clcrInput);
  const clcrVal = isNaN(parsedClcr) ? 0 : Math.max(0, parsedClcr);

  // Mencari rekomendasi dosis yang sesuai dengan rentang ClCr pasien
  const currentRecommendation = selectedAbx.adjustments.find(
    (item) => clcrVal >= item.minClcr && clcrVal <= item.maxClcr
  ) || selectedAbx.adjustments[selectedAbx.adjustments.length - 1];

  // Aksi simpan dosis yang disesuaikan ke daftar obat pasien v3
  const handleAddToMedications = () => {
    addMedication({
      name: selectedAbx.name,
      dose: currentRecommendation.dose,
      category: 'Antibiotik (Renal Adjusted)',
      source: `Auto-Sync ClCr (${clcrVal} mL/min)`
    });
    alert(`✅ ${selectedAbx.name} (${currentRecommendation.dose}) berhasil ditambahkan ke daftar obat aktif pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | ClCr terhitung otomatis dari profil pasien.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* HEADER INFORMASI */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">🦠 Kalkulator & Penyesuaian Dosis Antibiotik (Ginjal v3)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menentukan rekomendasi penyesuaian dosis obat antimikroba berdasarkan Klirens Kreatinin (ClCr) pasien untuk mencegah toksisitas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="antibiotic-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Pilih Antibiotik
            </label>
            <select
              id="antibiotic-select"
              value={antibiotic}
              onChange={(e) => setAntibiotic(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {Object.keys(ANTIBIOTIC_DATABASE).map((key) => (
                <option key={key} value={key}>{ANTIBIOTIC_DATABASE[key].name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="clcr-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Klirens Kreatinin Pasien (ClCr mL/min)
            </label>
            <input
              id="clcr-input"
              type="number"
              value={clcrInput}
              onChange={(e) => setClcrInput(e.target.value)}
              placeholder="e.g. 45"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
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
            <span className="text-[10px] text-blue-500 font-bold uppercase">Evaluasi Regimen v3</span>
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
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {currentRecommendation.note}
            </p>
          </div>
        </div>

        {/* TOMBOL AUTO-PUSH KE REGIMEN OBAT PASIEN V3 */}
        <div className="pt-3 border-t border-blue-500/20 flex justify-end">
          <button
            type="button"
            onClick={handleAddToMedications}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center gap-2"
          >
            ➕ Tambahkan ke Regimen Obat Pasien
          </button>
        </div>
      </div>

    </div>
  );
}