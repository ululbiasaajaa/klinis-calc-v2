import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePatientStore } from '../store/usePatientStore';

export default function ElectrolyteCorrectionCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // AMBIL DATA PASIEN GLOBAL DAN DISPATCH STORE V3
  const { patient, addLabRecord, addMedication } = usePatientStore();

  const [subTab, setSubTab] = useState('k'); // 'k', 'na', 'hco3'

  // Input Hipokalemia (K+)
  const [kInputs, setKInputs] = useState({ weight: '', currentK: '3.0', targetK: '4.0', route: 'iv' }); // 'iv' or 'oral'

  // Input Hiponatremia (Na+)
  const [naInputs, setNaInputs] = useState({ weight: '60', currentNa: '120', gender: 'male', targetNaIncrease: '6' }); // target na increase in 24h

  // Input Asidosis Metabolik (HCO3-)
  const [hco3Inputs, setHco3Inputs] = useState({ weight: '60', currentHco3: '12' });

  // Auto-sync data berat badan dan jenis kelamin dari Patient Context Bar
  useEffect(() => {
    if (patient) {
      const wtStr = patient.weightKg !== undefined && patient.weightKg !== '' ? String(patient.weightKg) : '';
      const isFemale = patient.gender === 'Perempuan';
      const mappedGender = isFemale ? 'female' : 'male';

      if (wtStr) {
        setKInputs((prev) => ({ ...prev, weight: wtStr }));
        setNaInputs((prev) => ({ ...prev, weight: wtStr, gender: mappedGender }));
        setHco3Inputs((prev) => ({ ...prev, weight: wtStr }));
      }
    }
  }, [patient]);

  // 1. Hitung Koreksi Kalium (KCl)
  const kWt = parseFloat(kInputs.weight);
  const kCur = parseFloat(kInputs.currentK);
  const kTgt = parseFloat(kInputs.targetK);
  let kDeficit = 0;

  if (!isNaN(kWt) && kWt > 0 && !isNaN(kCur) && !isNaN(kTgt)) {
    const diff = kTgt - kCur;
    if (diff > 0) {
      kDeficit = Number((diff * kWt * 0.4).toFixed(1));
    }
  }

  // 2. Hitung Koreksi Natrium (NaCl 3%)
  const naWt = parseFloat(naInputs.weight);
  const naCur = parseFloat(naInputs.currentNa);
  const naDelta = parseFloat(naInputs.targetNaIncrease) || 6;
  let naCorrection = { totalMl: 0, hourlyRate: 0, maxSafeRise: 8 };

  if (!isNaN(naWt) && naWt > 0 && !isNaN(naCur)) {
    const tbw = naWt * (naInputs.gender === 'female' ? 0.5 : 0.6);
    const naInfus = 513;
    const denominator = naInfus - naCur;

    if (denominator > 0) {
      const totalMlVal = (naDelta * tbw * 1000) / denominator;
      const hourlyRateVal = totalMlVal / 24;
      naCorrection = {
        totalMl: Number(totalMlVal.toFixed(0)),
        hourlyRate: Number(hourlyRateVal.toFixed(1)),
        maxSafeRise: 8
      };
    }
  }

  // 3. Hitung Defisit Bikarbonat (NaHCO3 8.4%)
  const hco3Wt = parseFloat(hco3Inputs.weight);
  const hco3Cur = parseFloat(hco3Inputs.currentHco3);
  let hco3Deficit = 0;

  if (!isNaN(hco3Wt) && hco3Wt > 0 && !isNaN(hco3Cur)) {
    const targetHco3 = 18.0;
    const diff = targetHco3 - hco3Cur;
    if (diff > 0) {
      const mEqVal = 0.5 * hco3Wt * diff;
      hco3Deficit = Number(mEqVal.toFixed(1));
    }
  }

  // Aksi simpan ke Outcome Tracker v3
  const handleSaveToTracker = (type) => {
    let param = '';
    let valStr = '';
    let unitStr = '';

    if (type === 'k') {
      param = 'Koreksi Kalium (K+)';
      valStr = `Defisit: ${kDeficit} mEq (Current: ${kInputs.currentK} -> Target: ${kInputs.targetK})`;
      unitStr = 'mEq/L';
    } else if (type === 'na') {
      param = 'Koreksi Natrium (NaCl 3%)';
      valStr = `NaCl 3%: ${naCorrection.totalMl} mL (Rate: ${naCorrection.hourlyRate} mL/h)`;
      unitStr = 'mEq/L';
    } else if (type === 'hco3') {
      param = 'Koreksi Bikarbonat (NaHCO3)';
      valStr = `Meylon 8.4%: ${hco3Deficit} mEq (~${hco3Deficit} mL)`;
      unitStr = 'mEq/L';
    }

    addLabRecord({
      date: new Date().toLocaleDateString('id-ID'),
      parameter: param,
      value: valStr,
      unit: unitStr,
      source: 'Koreksi Elektrolit v3'
    });
    alert(`✅ Data ${param} berhasil disimpan ke Outcome Tracker Pasien!`);
  };

  // Aksi simpan ke Regimen Obat Pasien Store v3
  const handleAddToMedications = (type) => {
    if (type === 'k') {
      addMedication({
        name: `KCl Infus / Oral (${kInputs.route === 'iv' ? 'IV Infus' : 'Oral'})`,
        dose: `${kDeficit} mEq KCl Total (Kecepatan max 10-20 mEq/jam)`,
        category: 'Koreksi Elektrolit / Kalium',
        source: `Target K+: ${kInputs.targetK} mEq/L`
      });
      alert(`✅ Infus KCl (${kDeficit} mEq) berhasil ditambahkan ke regimen obat aktif pasien!`);
    } else if (type === 'na') {
      addMedication({
        name: 'NaCl 3% Hipertonik',
        dose: `${naCorrection.totalMl} mL dalam 24 jam (Syringe Pump: ${naCorrection.hourlyRate} mL/jam)`,
        category: 'Koreksi Elektrolit / Natrium',
        source: `Target Kenaikan: ${naInputs.targetNaIncrease} mEq/L/24h`
      });
      alert(`✅ Infus NaCl 3% (${naCorrection.totalMl} mL) berhasil ditambahkan ke regimen obat aktif pasien!`);
    } else if (type === 'hco3') {
      addMedication({
        name: 'NaHCO3 8.4% (Meylon)',
        dose: `${hco3Deficit} mEq (~${hco3Deficit} mL Meylon 8.4% - berikan 50% awal)`,
        category: 'Koreksi Asidosis Bikarbonat',
        source: `HCO3- Current: ${hco3Inputs.currentHco3} mEq/L`
      });
      alert(`✅ NaHCO3 Meylon (${hco3Deficit} mL) berhasil ditambahkan ke regimen obat aktif pasien!`);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {patient?.patientName && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
          <span>✨ <strong>Pasien Aktif:</strong> {patient.patientName} (RM: {patient.patientId || '-'}) | Berat badan & jenis kelamin tersinkronisasi otomatis.</span>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">STORE V3 SYNCED</span>
        </div>
      )}

      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
      }`}>
        <p className="font-bold mb-1 text-blue-400">🩸 Modul Koreksi Elektrolit & Asam Basa Darurat (IGD / ICU v3):</p>
        <p className="text-[11px] leading-relaxed">
          Kalkulator presisi tinggi untuk menghitung kebutuhan koreksi elektrolit kritis guna mencegah komplikasi fatal (aritmia jantung, kejang, edema serebri, atau osmotic demyelination).
        </p>
      </div>

      {/* SUB-TABS PILIHAN KASUS ELEKTROLIT */}
      <div className={`flex rounded-xl p-1 gap-1 border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <button
          type="button"
          onClick={() => setSubTab('k')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'k'
              ? 'bg-blue-600 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚡ Hipokalemia (K+)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('na')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'na'
              ? 'bg-blue-600 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🧂 Hiponatremia (Na+)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('hco3')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            subTab === 'hco3'
              ? 'bg-blue-600 text-white shadow'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
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
              <label htmlFor="k-weight-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                BB Pasien (kg):
              </label>
              <input
                id="k-weight-input"
                type="number"
                value={kInputs.weight}
                onChange={(e) => setKInputs({ ...kInputs, weight: e.target.value })}
                placeholder="e.g. 60"
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="k-current-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                K+ Serum Saat Ini (mEq/L):
              </label>
              <input
                id="k-current-input"
                type="number"
                step="0.1"
                value={kInputs.currentK}
                onChange={(e) => setKInputs({ ...kInputs, currentK: e.target.value })}
                placeholder="e.g. 2.8"
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="k-target-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Target K+ Serum (mEq/L):
              </label>
              <input
                id="k-target-input"
                type="number"
                step="0.1"
                value={kInputs.targetK}
                onChange={(e) => setKInputs({ ...kInputs, targetK: e.target.value })}
                placeholder="e.g. 4.0"
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="k-route-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Jalur Pemberian:
              </label>
              <select
                id="k-route-select"
                value={kInputs.route}
                onChange={(e) => setKInputs({ ...kInputs, route: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="iv">Infus Vena Perifer / Sentral (Max 10-20 mEq/jam)</option>
                <option value="oral">Oral / P.O (KSR / Aspar K)</option>
              </select>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
            <span className="text-xs text-amber-500 font-bold block mb-1">HASIL ESTIMASI DEFISIT KALIUM</span>
            <div className={`text-2xl font-extrabold my-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {kDeficit} mEq KCl Total
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              • <strong>Aturan Keselamatan IV:</strong> Jangan pernah memberikan KCl bolus IV langsung! (Bisa memicu henti jantung fatal).<br />
              • Kecepatan infus perifer maksimal <strong>10 mEq/jam</strong> (dalam 100 mL NaCl 0.9%), via vena sentral maksimal <strong>20 mEq/jam</strong> dengan EKG monitoring.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleSaveToTracker('k')}
              className={`font-bold py-2 px-3 rounded-xl transition-all cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
              }`}
            >
              📈 Simpan ke Outcome Tracker
            </button>
            <button
              type="button"
              onClick={() => handleAddToMedications('k')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              ➕ Tambahkan Infus KCl ke Regimen Obat
            </button>
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
              <label htmlFor="na-weight-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                BB Pasien (kg):
              </label>
              <input
                id="na-weight-input"
                type="number"
                value={naInputs.weight}
                onChange={(e) => setNaInputs({ ...naInputs, weight: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="na-current-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Na+ Serum Saat Ini (mEq/L):
              </label>
              <input
                id="na-current-input"
                type="number"
                value={naInputs.currentNa}
                onChange={(e) => setNaInputs({ ...naInputs, currentNa: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="na-gender-select" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Jenis Kelamin:
              </label>
              <select
                id="na-gender-select"
                value={naInputs.gender}
                onChange={(e) => setNaInputs({ ...naInputs, gender: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-bold cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="male">Laki-laki (TBW = 60% BB)</option>
                <option value="female">Perempuan (TBW = 50% BB)</option>
              </select>
            </div>
            <div>
              <label htmlFor="na-target-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Target Kenaikan Na+ (dalam 24 jam):
              </label>
              <input
                id="na-target-input"
                type="number"
                value={naInputs.targetNaIncrease}
                onChange={(e) => setNaInputs({ ...naInputs, targetNaIncrease: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
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

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleSaveToTracker('na')}
              className={`font-bold py-2 px-3 rounded-xl transition-all cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
              }`}
            >
              📈 Simpan ke Outcome Tracker
            </button>
            <button
              type="button"
              onClick={() => handleAddToMedications('na')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              ➕ Tambahkan Infus NaCl 3% ke Regimen Obat
            </button>
          </div>
        </div>
      )}

      {/* KONTEN 3: ASIDOSIS METABOLIK (BICNAT) */}
      {subTab === 'hco3' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
            <span>🧪</span> Protokol Koreksi Defisit Bikarbonat (Meylon / NaHCO3 8.4%)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hco3-weight-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                BB Pasien (kg):
              </label>
              <input
                id="hco3-weight-input"
                type="number"
                value={hco3Inputs.weight}
                onChange={(e) => setHco3Inputs({ ...hco3Inputs, weight: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label htmlFor="hco3-current-input" className={`block mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                HCO3- Serum Saat Ini (mEq/L):
              </label>
              <input
                id="hco3-current-input"
                type="number"
                value={hco3Inputs.currentHco3}
                onChange={(e) => setHco3Inputs({ ...hco3Inputs, currentHco3: e.target.value })}
                className={`w-full p-3 rounded-xl border outline-none font-semibold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
            <span className="text-xs text-emerald-500 font-bold block mb-1">ESTIMASI KEBUTUHAN NaHCO3 8.4% (Meylon)</span>
            <div className={`text-2xl font-extrabold my-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {hco3Deficit} mEq (~ {hco3Deficit} mL Meylon 8.4%)
            </div>
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              • <strong>Aturan Klinis:</strong> Biasanya diberikan separuh (50%) dari total defisit di jam pertama secara infus lambat, sisanya dievaluasi ulang dengan pemeriksaan Analisis Gas Darah (AGD / Blood Gas Analysis).<br />
              • Sediaan standar Meylon 8.4% mengandung 1 mEq HCO3- per 1 mL ampul.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleSaveToTracker('hco3')}
              className={`font-bold py-2 px-3 rounded-xl transition-all cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
              }`}
            >
              📈 Simpan ke Outcome Tracker
            </button>
            <button
              type="button"
              onClick={() => handleAddToMedications('hco3')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              ➕ Tambahkan Meylon ke Regimen Obat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}