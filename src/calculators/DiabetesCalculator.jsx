import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function DiabetesCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State untuk Konversi HbA1c ke eAG
  const [hba1c, setHba1c] = useState('7.0');

  // State untuk Koreksi Insulin (ISF / Correction Factor)
  const [currentBg, setCurrentBg] = useState('250');
  const [targetBg, setTargetBg] = useState('150');
  const [insulinType, setInsulinType] = useState('rapid'); // 'rapid' (1500 rule) atau 'regular' (1800 rule - wait, 1800 is rapid, 1500 is regular)

  // State untuk Insulin-to-Carb Ratio (ICR)
  const [carbsGrams, setCarbsGrams] = useState('60');
  const [tdd, setTdd] = useState('40'); // Total Daily Dose Insulin

  // 1. Kalkulasi HbA1c ke eAG (Formula ADA: eAG = 28.7 * HbA1c - 46.7)
  const eagVal = (() => {
    const val = parseFloat(hba1c);
    if (!val || val <= 0) return 0;
    return Number((28.7 * val - 46.7).toFixed(0));
  })();

  // 2. Kalkulasi Koreksi Insulin (ISF) & Dosis Koreksi
  const { isf, correctionDose } = (() => {
    const cur = parseFloat(currentBg) || 0;
    const tgt = parseFloat(targetBg) || 0;
    const totalDose = parseFloat(tdd) || 40;

    if (totalDose <= 0) return { isf: 0, correctionDose: 0 };

    // Aturan 1500 untuk Insulin Regular, Aturan 1800 untuk Insulin Rapid-Acting (Lispro/Aspart/Glulisine)
    const ruleConstant = insulinType === 'rapid' ? 1800 : 1500;
    const calculatedIsf = ruleConstant / totalDose;

    let dose = 0;
    if (cur > tgt) {
      dose = (cur - tgt) / calculatedIsf;
    }

    return {
      isf: Number(calculatedIsf.toFixed(1)),
      correctionDose: Number(dose.toFixed(1))
    };
  })();

  // 3. Kalkulasi Insulin-to-Carb Ratio (ICR) -> 500 Rule untuk Rapid / 450 Rule untuk Regular
  const { icr, prandialDose } = (() => {
    const totalDose = parseFloat(tdd) || 40;
    const carbs = parseFloat(carbsGrams) || 0;

    if (totalDose <= 0) return { icr: 0, prandialDose: 0 };

    const icrConstant = insulinType === 'rapid' ? 500 : 450;
    const calculatedIcr = icrConstant / totalDose;
    const dose = calculatedIcr > 0 ? carbs / calculatedIcr : 0;

    return {
      icr: Number(calculatedIcr.toFixed(1)),
      prandialDose: Number(dose.toFixed(1))
    };
  })();

  const totalMealDose = Number((correctionDose + prandialDose).toFixed(1));

  return (
    <div className="space-y-6 text-xs">
      
      {/* BAGIAN 1: HbA1c & eAG CONVERTER */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">📉 1. Konversi HbA1c ke Estimated Average Glucose (eAG)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Mengonversi persentase HbA1c (rata-rata 3 bulan) menjadi kadar glukosa darah rata-rata dalam mg/dL (Standar ADA).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Nilai HbA1c Pasien (%)</label>
            <input
              type="number"
              step="0.1"
              value={hba1c}
              onChange={(e) => setHba1c(e.target.value)}
              placeholder="e.g. 7.5"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
            <span className="text-[10px] text-blue-500 font-bold block mb-1">GLUKOSA DARAH RATA-RATA (eAG)</span>
            <span className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{eagVal} <span className="text-xs font-normal text-slate-400">mg/dL</span></span>
          </div>
        </div>
      </div>


      {/* BAGIAN 2: INSULIN SENSITIVITY & CORRECTION FACTOR */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-emerald-500 mb-2">💉 2. Kalkulator Koreksi Gula Darah & Sensitivitas Insulin (ISF)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menghitung berapa banyak penurunan gula darah oleh 1 unit insulin (ISF) serta dosis koreksi hiperglikemia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Insulin</label>
            <select
              value={insulinType}
              onChange={(e) => setInsulinType(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="rapid">Rapid-Acting (Aspart/Lispro/Glulisine - Rule 1800)</option>
              <option value="regular">Regular / Short-Acting (Aktrapid - Rule 1500)</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total Daily Dose (TDD) Insulin (U/hari)</label>
            <input
              type="number"
              value={tdd}
              onChange={(e) => setTdd(e.target.value)}
              placeholder="e.g. 40"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Gula Darah Aktual (mg/dL)</label>
            <input
              type="number"
              value={currentBg}
              onChange={(e) => setCurrentBg(e.target.value)}
              placeholder="e.g. 250"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Gula Darah (mg/dL)</label>
            <input
              type="number"
              value={targetBg}
              onChange={(e) => setTargetBg(e.target.value)}
              placeholder="e.g. 150"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
            <div>
              <span className="text-[10px] text-emerald-500 font-bold block">FAKTOR SENSITIVITAS (ISF): <strong className="text-sm">{isf} mg/dL per Unit</strong></span>
              <span className="text-[10px] text-slate-400">Dosis koreksi untuk mencapai target glukosa</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{correctionDose} Unit</span>
            </div>
          </div>
        </div>
      </div>


      {/* BAGIAN 3: INSULIN-TO-CARB RATIO (ICR) */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-amber-500 mb-2">🍞 3. Insulin-to-Carb Ratio (ICR) & Dosis Makan (Prandial)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menghitung berapa gram karbohidrat yang dicakup oleh 1 unit insulin serta total dosis insulin saat makan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Estimasi Karbohidrat Makanan (Gram)</label>
            <input
              type="number"
              value={carbsGrams}
              onChange={(e) => setCarbsGrams(e.target.value)}
              placeholder="e.g. 60"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-500 font-bold block">ICR RATIO: <strong className="text-sm">1 Unit : {icr} Gram Karbo</strong></span>
              <span className="text-[10px] text-slate-400">Dosis insulin prandial</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{prandialDose} Unit</span>
            </div>
          </div>
        </div>

        {/* TOTAL DOSIS SEKALI SUNTIK (Koreksi + Makan) */}
        <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-blue-950/60 border-blue-700' : 'bg-blue-100 border-blue-300'}`}>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">TOTAL REKOMENDASI DOSIS INSULIN SEKALI SUNTIK (Koreksi + Makan)</span>
          <span className="text-3xl font-black text-blue-700 dark:text-white">{totalMealDose} Unit</span>
        </div>
      </div>

    </div>
  );
}