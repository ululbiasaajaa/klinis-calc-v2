import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ElectrolyteCorrectionCalculator() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const isDark = theme === 'dark';

  const [subTab, setSubTab] = useState('k'); // 'k', 'na', 'hco3'

  // Input Hipokalemia (K+)
  const [kInputs, setKInputs] = useState({ weight: '', currentK: '3.0', targetK: '4.0', route: 'iv' }); // 'iv' or 'oral'

  // Input Hiponatremia (Na+)
  const [naInputs, setNaInputs] = useState({ weight: '60', currentNa: '120', gender: 'male', targetNaIncrease: '6' }); // target na increase in 24h

  // Input Asidosis Metabolik (HCO3-)
  const [hco3Inputs, setHco3Inputs] = useState({ weight: '60', currentHco3: '12' });

  // 1. Hitung Koreksi Kalium (KCl)
  // Defisit K+ = (K_target - K_current) * 0.4 * BB (Extracellular shift approximation, total deficit ~ total body water * delta K)
  // Aturan umum klinis: Setiap penurunan 0.1 mEq/L di bawah 4.0 setara dengan defisit ~ 100 mEq total body (atau rumus empiris: (K_target - K_current) * BB * 0.4)
  const kDeficit = (() => {
    const { weight, currentK, targetK } = kInputs;
    if (!weight || !currentK || !targetK) return 0;
    const diff = parseFloat(targetK) - parseFloat(currentK);
    if (diff <= 0) return 0;
    // Estimasi kasar klinis: Devisit total (mEq) = diff * BB * 0.4 (atau faktor distribusi cairan ekstraseluler)
    return Number((diff * parseFloat(weight) * 0.4).toFixed(1));
  })();

  // 2. Hitung Koreksi Natrium (NaCl 3%) - Rumus Adrogue-Madias atau Devisiat TBW
  // TBW = 0.6 * BB (Laki-laki) atau 0.5 * BB (Perempuan)
  // Na change per liter infus = (Na_infus - Na_current) / (TBW + 1)
  const naCorrection = (() => {
    const { weight, currentNa, gender, targetNaIncrease } = naInputs;
    if (!weight || !currentNa) return { totalMl: 0, hourlyRate: 0, maxSafeRise: 8 };
    const tbw = parseFloat(weight) * (gender === 'female' ? 0.5 : 0.6);
    // Konsentrasi Na dalam NaCl 3% = 513 mEq/L
    const naInfus = 513;
    const curNa = parseFloat(currentNa);
    const deltaNa = parseFloat(targetNaIncrease) || 6; // misal target naik 6 mEq/L dalam 24 jam
    
    // Volume NaCl 3% (mL) = [Delta Na * TBW * 1000] / (Na_infus - Na_current)
    const denominator = naInfus - curNa;
    if (denominator <= 0) return { totalMl: 0, hourlyRate: 0, maxSafeRise: 8 };
    
    const totalMlVal = (deltaNa * tbw * 1000) / denominator;
    const hourlyRateVal = totalMlVal / 24;

    return {
      totalMl: Number(totalMlVal.toFixed(0)),
      hourlyRate: Number(hourlyRateVal.toFixed(1)),
      maxSafeRise: 8 // Batas aman maksimal kenaikan Na per 24 jam untuk cegah ODS (Osmotic Demyelination Syndrome)
    };
  })();

  // 3. Hitung Devisit Bikarbonat (NaHCO3 8.4%)
  // Devisit HCO3 = 0.5 * BB * (HCO3_target - HCO3_current) -> Target aman awal ~ 18-20 mEq/L
  const hco3Deficit = (() => {
    const { weight, currentHco3 } = hco3Inputs;
    if (!weight || !currentHco3) return 0;
    const curHco3 = parseFloat(currentHco3);
    const targetHco3 = 18.0; // Target darurat awal
    const diff = targetHco3 - curHco3;
    if (diff <= 0) return 0;
    // 0.5 * BB * diff (mEq)
    const mEqVal = 0.5 * parseFloat(weight) * diff;
    // NaHCO3 8.4% mengandung 1 mEq/mL
    return Number(mEqVal.toFixed(1));
  })();

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border text-xs ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1">🩸 Modul Koreksi Elektrolit & Asam Basa Darurat (IGD / ICU):</p>
        <p>
          Kalkulator presisi tinggi untuk menghitung kebutuhan koreksi elektrolit kritis guna mencegah komplikasi fatal (aritmia jantung, kejang, edema serebri, atau osmotic demyelination).
        </p>
      </div>

      {/* SUB-TABS PILIHAN KASUS ELEKTROLIT */}
      <div className="flex rounded-xl p-1 gap-1 border bg-slate-900/50 border-slate-800">
        <button
          onClick={() => setSubTab('k')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            subTab === 'k' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚡ Hipokalemia (K+)
        </button>
        <button
          onClick={() => setSubTab('na')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            subTab === 'na' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🧂 Hiponatremia (Na+)
        </button>
        <button
          onClick={() => setSubTab('hco3')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            subTab === 'hco3' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🧪 Asidosis (Bikarbonat)
        </button>
      </div>

      {/* KONTEN 1: HIPOKALEMIA */}
      {subTab === 'k' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm text-amber-500 flex items-center gap-2">
            <span>⚡</span> Protokol Koreksi Kalium (KCl)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg):</label>
              <input
                type="number"
                value={kInputs.weight}
                onChange={(e) => setKInputs({ ...kInputs, weight: e.target.value })}
                placeholder="e.g. 60"
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>K+ Serum Saat Ini (mEq/L):</label>
              <input
                type="number"
                step="0.1"
                value={kInputs.currentK}
                onChange={(e) => setKInputs({ ...kInputs, currentK: e.target.value })}
                placeholder="e.g. 2.8"
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target K+ Serum (mEq/L):</label>
              <input
                type="number"
                step="0.1"
                value={kInputs.targetK}
                onChange={(e) => setKInputs({ ...kInputs, targetK: e.target.value })}
                placeholder="e.g. 4.0"
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jalur Pemberian:</label>
              <select
                value={kInputs.route}
                onChange={(e) => setKInputs({ ...kInputs, route: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="iv">Infus Vena Perifer / Sentral (Max 10-20 mEq/jam)</option>
                <option value="oral">Oral / P.O (KSR / Aspar K)</option>
              </select>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
            <span className="text-xs text-amber-500 font-bold block mb-1">HASIL ESTIMASI DEVISIT KALIUM</span>
            <div className={`text-2xl font-extrabold my-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kDeficit} mEq KCl Total
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              • <strong>Aturan Keselamatan IV:</strong> Jangan pernah memberikan KCl bolus IV langsung! (Bisa memicu henti jantung fatal).<br />
              • Kecepatan infus perifer maksimal <strong>10 mEq/jam</strong> (dalam 100 mL NaCl 0.9%), via vena sentral maksimal <strong>20 mEq/jam</strong> dengan EKG monitoring.
            </p>
          </div>
        </div>
      )}

      {/* KONTEN 2: HIPONATREMIA */}
      {subTab === 'na' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm text-cyan-500 flex items-center gap-2">
            <span>🧂</span> Protokol Koreksi Hiponatremia Akut / Simptomatik (NaCl 3%)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg):</label>
              <input
                type="number"
                value={naInputs.weight}
                onChange={(e) => setNaInputs({ ...naInputs, weight: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Na+ Serum Saat Ini (mEq/L):</label>
              <input
                type="number"
                value={naInputs.currentNa}
                onChange={(e) => setNaInputs({ ...naInputs, currentNa: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Jenis Kelamin:</label>
              <select
                value={naInputs.gender}
                onChange={(e) => setNaInputs({ ...naInputs, gender: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="male">Laki-laki (TBW = 60% BB)</option>
                <option value="female">Perempuan (TBW = 50% BB)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Kenaikan Na+ (dalam 24 jam):</label>
              <input
                type="number"
                value={naInputs.targetNaIncrease}
                onChange={(e) => setNaInputs({ ...naInputs, targetNaIncrease: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-cyan-950/30 border-cyan-900/50' : 'bg-cyan-50 border-cyan-200'}`}>
            <span className="text-xs text-cyan-500 font-bold block mb-1">REKOMENDASI INFUS NaCl 3% (HIPERTONIK)</span>
            <div className="grid grid-cols-2 gap-4 my-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Volume NaCl 3% (24 Jam)</span>
                <span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{naCorrection.totalMl} mL</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Kecepatan Syringe Pump</span>
                <span className="text-xl font-extrabold text-cyan-500">{naCorrection.hourlyRate} mL/jam</span>
              </div>
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              ⚠️ <strong>PERINGATAN KERAS (OSMOTIC DEMYELINATION SYNDROME):</strong> Jangan pernah menaikkan natrium serum lebih dari <strong>8-10 mEq/L per 24 jam</strong> atau 18 mEq/L per 48 jam! Over-koreksi bisa menyebabkan kelumpuhan permanen atau kematian otak.
            </p>
          </div>
        </div>
      )}

      {/* KONTEN 3: ASIDOSIS METABOLIK (BICNAT) */}
      {subTab === 'hco3' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
            <span>🧪</span> Protokol Koreksi Devisit Bikarbonat (Meylon / NaHCO3 8.4%)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>BB Pasien (kg):</label>
              <input
                type="number"
                value={hco3Inputs.weight}
                onChange={(e) => setHco3Inputs({ ...hco3Inputs, weight: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>HCO3- Serum Saat Ini (mEq/L):</label>
              <input
                type="number"
                value={hco3Inputs.currentHco3}
                onChange={(e) => setHco3Inputs({ ...hco3Inputs, currentHco3: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
            <span className="text-xs text-emerald-500 font-bold block mb-1">ESTIMASI KEBUTUHAN NaHCO3 8.4% (Meylon)</span>
            <div className={`text-2xl font-extrabold my-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {hco3Deficit} mEq (~ {hco3Deficit} mL Meylon 8.4%)
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              • <strong>Aturan Klinis:</strong> Biasanya diberikan separuh (50%) dari total devisit di jam pertama secara infus lambat, sisanya dievaluasi ulang dengan pemeriksaan Analisis Gas Darah (AGD / Blood Gas Analysis).<br />
              • Sediaan standar Meylon 8.4% mengandung 1 mEq HCO3- per 1 mL ampul.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}