import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function CrrtDoseCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  // Database Sampel Antibiotik ICU & CRRT
  const crrtDrugDatabase = [
    { id: 'meropenem', name: 'Meropenem (Severe Sepsis / Pseudomonas)', normalDose: '1000 mg tiap 8 jam', crrtRec: '1.0g - 2.0g tiap 8 jam (Infus diperpanjang / Extended Infusion 3 jam).' },
    { id: 'pip_tazo', name: 'Piperacillin / Tazobactam', normalDose: '4.5g tiap 6 jam', crrtRec: '3.375g - 4.5g tiap 6-8 jam (High clearance via CVVHDF).' },
    { id: 'vancomycin', name: 'Vancomycin (TDM Driven)', normalDose: '15-20 mg/kg tiap 12 jam', crrtRec: 'Loading dose 25-30 mg/kg, maintenance disesuaikan kadar Trough (Target 15-20 mcg/mL).' },
    { id: 'colistin', name: 'Colistin (MDR Gram-Negatif)', normalDose: '9 MIU loading, lalu 4.5 MIU tiap 12 jam', crrtRec: 'Tidak tereliminasi signifikan oleh CRRT. Gunakan dosis standar pasca-loading.' },
    { id: 'levofloxacin', name: 'Levofloxacin', normalDose: '500 mg / 750 mg tiap 24 jam', crrtRec: '500 mg tiap 24-48 jam tergantung efisiensi effluent rate CRRT.' }
  ];

  const [selectedDrug, setSelectedDrug] = useState('meropenem');
  const [effluentRate, setEffluentRate] = useState('35'); // mL/kg/hr (Standard CRRT dose 20-35)
  const [residualUrine, setResidualUrine] = useState('low'); // 'zero', 'low', 'normal'

  const drugInfo = crrtDrugDatabase.find((d) => d.id === selectedDrug) || crrtDrugDatabase[0];

  // Evaluasi Penyesuaian Dosis CRRT
  const evaluateCrrt = () => {
    const rate = parseFloat(effluentRate) || 30;
    let adjustmentNote = '';
    
    if (rate >= 35) {
        adjustmentNote = '⚠️ Effluent Rate Tinggi (>35 mL/kg/h): Risiko klirens antibiotik beta-laktam sangat tinggi. Wajib naikkan frekuensi atau berikan secara Extended Infusion!';
    } else if (rate >= 20) {
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

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border text-xs ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1">🌡️ Modul Penyesuaian Dosis ICU & CRRT (Continuous Renal Replacement Therapy):</p>
        <p>
          Mesin cuci darah kontinyu di ICU mengeliminasi obat secara masif. Kalkulator ini memberikan panduan penyesuaian dosis antibiotik kritis agar mencapai target farmakodinamik (PK/PD).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PILIH OBAT ICU */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Pilih Antibiotik / Obat Kritis:' : 'Select Critical Drug:'}
          </label>
          <select
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          >
            {crrtDrugDatabase.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* EFFLUENT RATE CRRT */}
        <div>
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Effluent Rate CRRT (mL/kg/jam):' : 'CRRT Effluent Rate (mL/kg/hr):'}
          </label>
          <input
            type="number"
            value={effluentRate}
            onChange={(e) => setEffluentRate(e.target.value)}
            placeholder="e.g. 35"
            className={`w-full p-3 rounded-xl border outline-none text-xs ${
              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
            }`}
          />
        </div>

        {/* PRODUKSI URIN RESIDU */}
        <div className="md:col-span-2">
          <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {lang === 'id' ? 'Produksi Urin Residu Pasien:' : 'Residual Urine Output:'}
          </label>
          <select
            value={residualUrine}
            onChange={(e) => setResidualUrine(e.target.value)}
            className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${
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
      <div className={`p-5 rounded-2xl border ${
        isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
      }`}>
        <span className="text-xs text-blue-500 font-bold block mb-1">
          {lang === 'id' ? 'REKOMENDASI DOSIS DI SETTING CRRT' : 'RECOMMENDED CRRT DOSING'}
        </span>
        <div className={`text-xl font-extrabold my-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {drugInfo.crrtRec}
        </div>
        <p className={`text-xs mt-2 p-3 rounded-lg border ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-blue-100 text-slate-700'
        }`}>
          <strong>Analisis Klinis ICU:</strong> {clinicalEvaluation}
        </p>
      </div>

      {/* CATATAN PANDUAN PK/PD */}
      <div className={`p-4 rounded-xl border text-xs space-y-2 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          💡 Prinsip Farmakodinamik (PK/PD) Antibiotik di ICU:
        </p>
        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          • <strong>Time-dependent killing ($fT &gt; MIC$):</strong> Golongan Beta-laktam (Meropenem, Piperacillin) sangat efektif jika kadar obat di atas MIC bakteri dipertahankan sepanjang waktu, sehingga teknik **Extended Infusion (3-4 jam)** sangat direkomendasikan pada CRRT.<br />
          • <strong>Membran High-Flux CRRT:</strong> Sebagian besar antibiotik molekul kecil bersifat lolos (*dialyzable*) melewati membran filter CRRT.
        </p>
      </div>
    </div>
  );
}