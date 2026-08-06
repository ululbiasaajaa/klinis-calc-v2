import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function DiabetesCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN & DISPATCHERS LANGSUNG DARI STORE V3
  const { patient, addMedication, addLabRecord } = usePatientStore();

  // State untuk Konversi HbA1c ke eAG
  const [hba1c, setHba1c] = useState('7.0');

  // State untuk Koreksi Insulin (ISF / Correction Factor)
  const [currentBg, setCurrentBg] = useState('250');
  const [targetBg, setTargetBg] = useState('150');
  const [insulinType, setInsulinType] = useState('rapid'); // 'rapid' (1800 rule) atau 'regular' (1500 rule)

  // State untuk Insulin-to-Carb Ratio (ICR)
  const [carbsGrams, setCarbsGrams] = useState('60');
  const [tdd, setTdd] = useState('40'); // Total Daily Dose Insulin

  // Auto-sync berat badan dari Patient Context Bar untuk estimasi TDD (Default 0.5 unit/kg)
  useEffect(() => {
    if (patient && patient.weightKg !== undefined && patient.weightKg !== '') {
      const wt = parseFloat(patient.weightKg);
      if (!isNaN(wt) && wt > 0) {
        const estimatedTdd = Math.round(wt * 0.5);
        setTdd(String(estimatedTdd));
      }
    }
  }, [patient]);

  // 1. Kalkulasi HbA1c ke eAG (Formula ADA: eAG = 28.7 * HbA1c - 46.7)
  const hba1cVal = parseFloat(hba1c);
  const eagVal = (!isNaN(hba1cVal) && hba1cVal > 0)
    ? Math.max(0, Number((28.7 * hba1cVal - 46.7).toFixed(0)))
    : 0;

  // 2. Kalkulasi Koreksi Insulin (ISF) & Dosis Koreksi
  const curBg = parseFloat(currentBg);
  const tgtBg = parseFloat(targetBg);
  const totalDose = parseFloat(tdd);

  let isf = 0;
  let correctionDose = 0;

  if (!isNaN(totalDose) && totalDose > 0) {
    const ruleConstant = insulinType === 'rapid' ? 1800 : 1500;
    const calculatedIsf = ruleConstant / totalDose;
    isf = Number(calculatedIsf.toFixed(1));

    if (!isNaN(curBg) && !isNaN(tgtBg) && curBg > tgtBg) {
      correctionDose = Number(((curBg - tgtBg) / calculatedIsf).toFixed(1));
    }
  }

  // 3. Kalkulasi Insulin-to-Carb Ratio (ICR)
  const carbs = parseFloat(carbsGrams);
  let icr = 0;
  let prandialDose = 0;

  if (!isNaN(totalDose) && totalDose > 0) {
    const icrConstant = insulinType === 'rapid' ? 500 : 450;
    const calculatedIcr = icrConstant / totalDose;
    icr = Number(calculatedIcr.toFixed(1));

    if (!isNaN(carbs) && carbs > 0 && calculatedIcr > 0) {
      prandialDose = Number((carbs / calculatedIcr).toFixed(1));
    }
  }

  const totalMealDose = Number((correctionDose + prandialDose).toFixed(1));

  // Aksi simpan ke Regimen Obat Pasien Store v3
  const handleAddToMedications = () => {
    addMedication({
      name: `Insulin ${insulinType === 'rapid' ? 'Rapid-Acting (Aspart/Lispro)' : 'Regular (Actrapid)'}`,
      dose: `${totalMealDose} Unit (Koreksi: ${correctionDose}U + Prandial: ${prandialDose}U)`,
      category: 'Antidiabetes / Insulin',
      source: `Diabetes Calculator (GD: ${currentBg} mg/dL)`
    });
    alert(`✅ Regimen Insulin (${totalMealDose} Unit) berhasil ditambahkan ke daftar obat aktif pasien!`);
  };

  // Simpan nilai Gula Darah & eAG ke Outcome Tracker
  const handleSaveGlucToRecord = () => {
    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: 'Gula Darah & eAG',
      value: `${currentBg} mg/dL (eAG: ${eagVal})`,
      unit: 'mg/dL',
      source: `HbA1c ${hba1c}%`
    });
    alert(`✅ Data Glukosa (${currentBg} mg/dL) & eAG (${eagVal} mg/dL) berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Estimasi TDD dihitung otomatis dari berat badan pasien.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      {/* BAGIAN 1: HbA1c & eAG CONVERTER */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-blue-500 mb-2">📉 1. Konversi HbA1c ke Estimated Average Glucose (eAG)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Mengonversi persentase HbA1c (rata-rata 3 bulan) menjadi kadar glukosa darah rata-rata dalam mg/dL (Standar ADA).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label htmlFor="hba1c-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Nilai HbA1c Pasien (%)
            </label>
            <input
              id="hba1c-input"
              type="number"
              step="0.1"
              value={hba1c}
              onChange={(e) => setHba1c(e.target.value)}
              placeholder="e.g. 7.5"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'}`}>
            <span className="text-[10px] text-blue-500 font-bold block mb-1">GLUKOSA DARAH RATA-RATA (eAG)</span>
            <span className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {eagVal} <span className="text-xs font-normal text-slate-400">mg/dL</span>
            </span>
          </div>
        </div>
      </div>

      {/* BAGIAN 2: INSULIN SENSITIVITY & CORRECTION FACTOR */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className="font-bold text-emerald-500 mb-2">💉 2. Kalkulator Koreksi Gula Darah & Sensitivitas Insulin (ISF)</h3>
        <p className="text-slate-400 text-[11px] mb-4">
          Menhitung berapa banyak penurunan gula darah oleh 1 unit insulin (ISF) serta dosis koreksi hiperglikemia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="insulin-type-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Jenis Insulin
            </label>
            <select
              id="insulin-type-select"
              value={insulinType}
              onChange={(e) => setInsulinType(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none text-xs cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="rapid">Rapid-Acting (Aspart/Lispro/Glulisine - Rule 1800)</option>
              <option value="regular">Regular / Short-Acting (Actrapid - Rule 1500)</option>
            </select>
          </div>

          <div>
            <label htmlFor="tdd-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Total Daily Dose (TDD) Insulin (U/hari)
            </label>
            <input
              id="tdd-input"
              type="number"
              value={tdd}
              onChange={(e) => setTdd(e.target.value)}
              placeholder="e.g. 40"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="current-bg-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Gula Darah Aktual (mg/dL)
            </label>
            <input
              id="current-bg-input"
              type="number"
              value={currentBg}
              onChange={(e) => setCurrentBg(e.target.value)}
              placeholder="e.g. 250"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="target-bg-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Target Gula Darah (mg/dL)
            </label>
            <input
              id="target-bg-input"
              type="number"
              value={targetBg}
              onChange={(e) => setTargetBg(e.target.value)}
              placeholder="e.g. 150"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30">
            <div>
              <span className="text-[10px] text-emerald-500 font-bold block">
                FAKTOR SENSITIVITAS (ISF): <strong className="text-sm">{isf} mg/dL per Unit</strong>
              </span>
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
          Menhitung berapa gram karbohidrat yang dicakup oleh 1 unit insulin serta total dosis insulin saat makan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="carbs-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Estimasi Karbohidrat Makanan (Gram)
            </label>
            <input
              id="carbs-input"
              type="number"
              value={carbsGrams}
              onChange={(e) => setCarbsGrams(e.target.value)}
              placeholder="e.g. 60"
              className={`w-full p-2.5 rounded-xl border outline-none text-xs font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-500 font-bold block">
                ICR RATIO: <strong className="text-sm">1 Unit : {icr} Gram Karbo</strong>
              </span>
              <span className="text-[10px] text-slate-400">Dosis insulin prandial</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{prandialDose} Unit</span>
            </div>
          </div>
        </div>

        {/* TOTAL DOSIS SEKALI SUNTIK (Koreksi + Makan) */}
        <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-blue-950/60 border-blue-700' : 'bg-blue-100 border-blue-300'}`}>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">
            TOTAL REKOMENDASI DOSIS INSULIN SEKALI SUNTIK (Koreksi + Makan)
          </span>
          <span className="text-3xl font-black text-blue-700 dark:text-white">{totalMealDose} Unit</span>
        </div>
      </div>

      {/* AKSI SIMPAN DAN DISTRIBUSI KE STORE V3 */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={handleSaveGlucToRecord}
          className={`font-bold py-2.5 px-4 rounded-xl transition-all text-xs cursor-pointer flex items-center gap-2 border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
          }`}
        >
          📈 Simpan Glukosa & eAG ke Outcome Tracker
        </button>
        <button
          type="button"
          onClick={handleAddToMedications}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all text-xs cursor-pointer flex items-center gap-2"
        >
          ➕ Tambahkan Dosis Insulin ke Regimen Pasien
        </button>
      </div>

    </div>
  );
}