import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatientStore } from '../store/usePatientStore';

// Database Sampel Antibiotik ICU & CRRT
// Dipindahkan ke luar komponen untuk efisiensi memori (mencegah re-allocation tiap render)
const CRRT_DRUG_DATABASE = [
  { id: 'meropenem', name: 'Meropenem (Severe Sepsis / Pseudomonas)', normalDose: '1000 mg tiap 8 jam', crrtRec: '1.0g - 2.0g tiap 8 jam (Infus diperpanjang / Extended Infusion 3 jam).' },
  { id: 'pip_tazo', name: 'Piperacillin / Tazobactam', normalDose: '4.5g tiap 6 jam', crrtRec: '3.375g - 4.5g tiap 6-8 jam (High clearance via CVVHDF).' },
  { id: 'vancomycin', name: 'Vancomycin (TDM Driven)', normalDose: '15-20 mg/kg tiap 12 jam', crrtRec: 'Loading dose 25-30 mg/kg, maintenance disesuaikan kadar Trough (Target 15-20 mcg/mL).' },
  { id: 'colistin', name: 'Colistin (MDR Gram-Negatif)', normalDose: '9 MIU loading, lalu 4.5 MIU tiap 12 jam', crrtRec: 'Tidak tereliminasi signifikan oleh CRRT. Gunakan dosis standar pasca-loading.' },
  { id: 'levofloxacin', name: 'Levofloxacin', normalDose: '500 mg / 750 mg tiap 24 jam', crrtRec: '500 mg tiap 24-48 jam tergantung efisiensi effluent rate CRRT.' }
];

export default function CrrtDoseCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // AMBIL PASIEN & DISPATCH MEDICATION LANGSUNG DARI STORE V3
  const { patient, addMedication } = usePatientStore();

  const [selectedDrug, setSelectedDrug] = useState('meropenem');
  const [effluentRate, setEffluentRate] = useState('35'); // mL/kg/hr (Standard CRRT dose 20-35)
  const [residualUrine, setResidualUrine] = useState('low'); // 'zero', 'low', 'normal'

  const drugInfo = CRRT_DRUG_DATABASE.find((d) => d.id === selectedDrug) || CRRT_DRUG_DATABASE[0];

  // Evaluasi Penyesuaian Dosis CRRT
  const evaluateCrrt = () => {
    const rate = parseFloat(effluentRate);
    const validRate = isNaN(rate) ? 30 : rate;
    let adjustmentNote = '';
    
    if (validRate >= 35) {
      adjustmentNote = '⚠️ Effluent Rate Tinggi (>35 mL/kg/h): Risiko klirens antibiotik beta-laktam sangat tinggi. Wajib naikkan frekuensi atau berikan secara Extended Infusion!';
    } else if (validRate >= 20) {
      adjustmentNote = '✅ Effluent Rate Standar (20-35 mL/kg/h): Gunakan rekomendasi dosis standar CRRT.';
    } else {
      adjustmentNote = 'ℹ️ Effluent Rate Rendah: Perhatikan risiko akumulasi obat jika bersihan ginjal sisa memburuk.';
    }

    if (residualUrine === 'normal') {
      adjustmentNote += ' Pasien masih memiliki urin residu, pertimbangkan penambahan klirens ginjal residual.';
    }

    return adjustmentNote;
  };

  const clinicalEvaluation = evaluateCrrt();

  // Hitung Estimasi Total Effluent Flow Rate (mL/jam) berdasarkan BB Pasien
  const patientWeight = parseFloat(patient?.weightKg) || 0;
  const parsedRate = parseFloat(effluentRate);
  const validEffluentRate = isNaN(parsedRate) ? 0 : parsedRate;
  const totalEffluentFlow = patientWeight > 0 && validEffluentRate > 0 ? validEffluentRate * patientWeight : 0;

  // Push ke Regimen Obat Pasien Store v3
  const handleAddToMedications = () => {
    addMedication({
      name: drugInfo.name,
      dose: drugInfo.crrtRec,
      category: 'Antibiotik ICU / CRRT',
      source: `CRRT Effluent Rate (${validEffluentRate} mL/kg/h)`
    });
    alert(`✅ ${drugInfo.name} berhasil ditambahkan ke regimen obat aktif pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Evaluasi dosis CRRT & antibiotik ICU.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* HEADER INFORMASI */}
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1 text-blue-400">🌡️ Modul Penyesuaian Dosis ICU & CRRT (Continuous Renal Replacement Therapy v3):</p>
        <p className="text-[11px] leading-relaxed">
          Mesin cuci darah kontinyu di ICU mengeliminasi obat secara masif. Kalkulator ini memberikan panduan penyesuaian dosis antibiotik kritis agar mencapai target farmakodinamik (PK/PD).
        </p>
      </div>

      {/* INPUT PARAMETER CRRT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PILIH OBAT ICU */}
        <div>
          <label htmlFor="drug-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Pilih Antibiotik / Obat Kritis:' : 'Select Critical Drug:'}
          </label>
          <select
            id="drug-select"
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            {CRRT_DRUG_DATABASE.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* EFFLUENT RATE CRRT */}
        <div>
          <label htmlFor="effluent-rate-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Effluent Rate CRRT (mL/kg/jam):' : 'CRRT Effluent Rate (mL/kg/hr):'}
          </label>
          <input
            id="effluent-rate-input"
            type="number"
            value={effluentRate}
            onChange={(e) => setEffluentRate(e.target.value)}
            placeholder="e.g. 35"
            className={`w-full p-3 rounded-xl border outline-none font-semibold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* PRODUKSI URIN RESIDU */}
        <div className="md:col-span-2">
          <label htmlFor="residual-urine-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Produksi Urin Residu Pasien:' : 'Residual Urine Output:'}
          </label>
          <select
            id="residual-urine-select"
            value={residualUrine}
            onChange={(e) => setResidualUrine(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            <option value="zero">Anuria / Oliguria (&lt; 100 mL/hari)</option>
            <option value="low">Rendah (100 - 500 mL/hari)</option>
            <option value="normal">Normal / Poliuria (&gt; 500 mL/hari)</option>
          </select>
        </div>
      </div>

      {/* HASIL REKOMENDASI DOSIS CRRT */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex justify-between items-center border-b pb-2 border-blue-500/20">
          <span className="text-xs text-blue-500 font-bold block">
            {lang === 'id' ? 'REKOMENDASI DOSIS DI SETTING CRRT v3' : 'RECOMMENDED CRRT DOSING v3'}
          </span>
          {totalEffluentFlow > 0 && (
            <span className="text-[10px] bg-blue-900/60 px-2 py-0.5 rounded text-blue-300 font-mono">
              Total Flow Rate: {totalEffluentFlow} mL/jam
            </span>
          )}
        </div>

        <div className={`text-lg font-extrabold my-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {drugInfo.crrtRec}
        </div>

        <div className={`p-3 rounded-xl border ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-blue-100 text-slate-700'
        }`}>
          <strong className="text-amber-500 block mb-0.5">Analisis Klinis ICU:</strong>
          <p className="leading-relaxed">{clinicalEvaluation}</p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAddToMedications}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center gap-2"
          >
            ➕ Tambahkan ke Regimen Obat Pasien
          </button>
        </div>
      </div>

      {/* CATATAN PANDUAN PK/PD */}
      <div className={`p-4 rounded-xl border space-y-2 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          💡 Prinsip Farmakodinamik (PK/PD) Antibiotik di ICU:
        </p>
        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          • <strong>Time-dependent killing:</strong> Golongan Beta-laktam (Meropenem, Piperacillin) sangat efektif jika kadar obat di atas MIC bakteri dipertahankan sepanjang waktu, sehingga teknik <strong>Extended Infusion (3-4 jam)</strong> sangat direkomendasikan pada CRRT.<br />
          • <strong>Membran High-Flux CRRT:</strong> Sebagian besar antibiotik molekul kecil bersifat lolos (*dialyzable*) melewati membran filter CRRT.
        </p>
      </div>

    </div>
  );
}