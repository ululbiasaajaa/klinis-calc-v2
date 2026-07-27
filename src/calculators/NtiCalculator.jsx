import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function NtiCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ntiSubTab, setNtiSubTab] = useState('phenytoin');

  // 1. Phenytoin States
  const [phenytoinObs, setPhenytoinObs] = useState('');
  const [albumin, setAlbumin] = useState('4.0');

  // 2. Vancomycin States
  const [vancoWeight, setVancoWeight] = useState('');
  const [vancoScr, setVancoScr] = useState('');
  const [vancoAge, setVancoAge] = useState('');
  const [vancoGender, setVancoGender] = useState('male');
  const [vancoDailyDose, setVancoDailyDose] = useState('2000');

  // 3. Theophylline States (THE FIX!)
  const [theoLevel, setTheoLevel] = useState('6.0');
  const [theoDose, setTheoDose] = useState('600');

  // 4. Warfarin States (THE FIX!)
  const [warfarinInr, setWarfarinInr] = useState('1.5');
  const [warfarinDoseWeekly, setWarfarinDoseWeekly] = useState('35'); // mg per minggu

  // 5. Aminoglycoside States (THE FIX!)
  const [aminoDrug, setAminoDrug] = useState('amikacin');
  const [aminoWeight, setAminoWeight] = useState('60');
  const [aminoHeight, setAminoHeight] = useState('165');
  const [aminoGender, setAminoGender] = useState('male');
  const [aminoScr, setAminoScr] = useState('1.0');
  const [aminoAge, setAminoAge] = useState('50');

  // --- LOGIKA KALKULASI NTI ---

  // A. Phenytoin Terkoreksi
  const phenytoinAdj = (() => {
    const obs = parseFloat(phenytoinObs) || 0;
    const alb = parseFloat(albumin) || 4.0;
    if (obs <= 0) return 0;
    return Number((obs / ((0.2 * alb) + 0.1)).toFixed(2));
  })();

  // B. Vancomycin AUC
  const vancoAuc = (() => {
    const w = parseFloat(vancoWeight) || 0;
    const s = parseFloat(vancoScr) || 0;
    const a = parseFloat(vancoAge) || 0;
    const d = parseFloat(vancoDailyDose) || 0;
    if (w <= 0 || s <= 0 || a <= 0) return 0;

    let clcr = ((140 - a) * w) / (72 * s);
    if (vancoGender === 'female') clcr *= 0.85;
    const estCl = clcr * 0.06;
    if (estCl <= 0) return 0;
    return Number((d / estCl).toFixed(1));
  })();

  // C. Theophylline Dosing Adjustment (Target Terapeutik: 10 - 20 mcg/mL)
  const theoRec = (() => {
    const lvl = parseFloat(theoLevel) || 0;
    const dose = parseFloat(theoDose) || 0;
    if (lvl <= 0 || dose <= 0) return { newDose: 0, status: 'Masukkan data valid' };

    const targetMid = 15.0; // Target tengah
    let newDose = (dose * targetMid) / lvl;
    let status = 'Kadar dalam batas terapeutik (10 - 20 mcg/mL). Pertahankan.';

    if (lvl < 10) {
      status = '⚠️ Sub-terapeutik (Kadar rendah). Dosis perlu dinaikkan.';
    } else if (lvl > 20) {
      status = '🚨 Toksik / Di atas target! Hentikan sementara atau turunkan dosis.';
      newDose = dose * 0.75; // Turunkan 25%
    }

    return {
      newDose: Number(newDose.toFixed(0)),
      status
    };
  })();

  // D. Warfarin Adjustment
  const warfarinRec = (() => {
    const inr = parseFloat(warfarinInr) || 0;
    const weekly = parseFloat(warfarinDoseWeekly) || 0;
    if (inr <= 0 || weekly <= 0) return { action: 'Masukkan data valid', newWeekly: 0 };

    let newWeekly = weekly;
    let action = 'INR Stabil (Target 2.0 - 3.0). Lanjutkan dosis saat ini.';

    if (inr < 1.5) {
      action = 'INR terlalu rendah (< 1.5). Naikkan dosis total mingguan 10-15%.';
      newWeekly = weekly * 1.12;
    } else if (inr >= 1.5 && inr < 2.0) {
      action = 'INR sedikit di bawah target. Naikkan dosis mingguan 5-10%.';
      newWeekly = weekly * 1.07;
    } else if (inr > 3.0 && inr <= 3.5) {
      action = 'INR sedikit di atas target. Turunkan dosis mingguan 5-10%.';
      newWeekly = weekly * 0.93;
    } else if (inr > 3.5) {
      action = '🚨 INR Tinggi (> 3.5)! Risiko perdarahan. Skip 1 dosis dan turunkan dosis mingguan 15-20%.';
      newWeekly = weekly * 0.82;
    }

    return {
      action,
      newWeekly: Number(newWeekly.toFixed(1))
    };
  })();

  // E. Aminoglycoside Dosing (Amikacin / Gentamicin)
  const aminoCalc = (() => {
    const h = parseFloat(aminoHeight) || 165;
    const a = parseFloat(aminoAge) || 50;
    const s = parseFloat(aminoScr) || 1.0;
    const w = parseFloat(aminoWeight) || 60;

    let ibw = h > 60 ? (aminoGender === 'female' ? 45.5 : 50) + 2.3 * ((h / 2.54) - 60) : (aminoGender === 'female' ? 45.5 : 50);
    let clcr = ((140 - a) * w) / (72 * s);
    if (aminoGender === 'female') clcr *= 0.85;

    let doseMg = aminoDrug === 'amikacin' ? ibw * 15 : ibw * 5; // Dosis once-daily empiris
    let interval = '24 Jam';
    if (clcr < 50 && clcr >= 30) interval = '36 Jam';
    else if (clcr < 30) interval = '48 Jam / Berdasarkan TDM Puncak-Tembah';

    return {
      ibw: Number(ibw.toFixed(1)),
      clcr: Number(clcr.toFixed(1)),
      recDose: Number(doseMg.toFixed(0)),
      interval
    };
  })();

  return (
    <div className="space-y-4 text-xs">
      
      {/* SUB-TABS SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button onClick={() => setNtiSubTab('phenytoin')} className={`p-2.5 rounded-xl font-bold border transition-all ${ntiSubTab === 'phenytoin' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          💊 Phenytoin
        </button>
        <button onClick={() => setNtiSubTab('vancomycin')} className={`p-2.5 rounded-xl font-bold border transition-all ${ntiSubTab === 'vancomycin' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🧪 Vancomycin
        </button>
        <button onClick={() => setNtiSubTab('theophylline')} className={`p-2.5 rounded-xl font-bold border transition-all ${ntiSubTab === 'theophylline' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          ☕ Theophylline
        </button>
        <button onClick={() => setNtiSubTab('warfarin')} className={`p-2.5 rounded-xl font-bold border transition-all ${ntiSubTab === 'warfarin' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🩸 Warfarin
        </button>
        <button onClick={() => setNtiSubTab('aminoglycoside')} className={`p-2.5 rounded-xl font-bold border transition-all col-span-2 sm:col-span-1 ${ntiSubTab === 'aminoglycoside' ? 'bg-blue-600 text-white border-blue-500 shadow-md' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          🦠 Aminoglikosida
        </button>
      </div>

      {/* KONTEN SUB-TAB 1: PHENYTOIN */}
      {ntiSubTab === 'phenytoin' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">💊 Koreksi Kadar Phenytoin (Hipoalbuminemia)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Kadar Phenytoin Observasi (mg/L)</label>
              <input type="number" step="0.1" value={phenytoinObs} onChange={(e) => setPhenytoinObs(e.target.value)} placeholder="e.g. 8.5" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Albumin Serum (g/dL)</label>
              <input type="number" step="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)} placeholder="e.g. 2.5" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex justify-between items-center">
            <span className="font-bold text-blue-500">Phenytoin Terkoreksi:</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{phenytoinAdj} mg/L (Target: 10 - 20)</span>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 2: VANCOMYCIN */}
      {ntiSubTab === 'vancomycin' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🧪 Vancomycin TDM & Estimasi AUC</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block mb-1 font-semibold">BB Pasien (kg)</label><input type="number" value={vancoWeight} onChange={(e) => setVancoWeight(e.target.value)} placeholder="65" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Serum Creatinine (mg/dL)</label><input type="number" step="0.1" value={vancoScr} onChange={(e) => setVancoScr(e.target.value)} placeholder="1.2" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Usia (Tahun)</label><input type="number" value={vancoAge} onChange={(e) => setVancoAge(e.target.value)} placeholder="55" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Jenis Kelamin</label><select value={vancoGender} onChange={(e) => setVancoGender(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
            <div><label className="block mb-1 font-semibold">Total Dosis Harian (mg/hari)</label><input type="number" value={vancoDailyDose} onChange={(e) => setVancoDailyDose(e.target.value)} placeholder="2000" className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
          </div>
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex justify-between items-center">
            <span className="font-bold text-blue-500">Estimasi AUC 24 Jam:</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{vancoAuc} mg·hr/L (Target: 400 - 600)</span>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 3: THEOPHYLLINE */}
      {ntiSubTab === 'theophylline' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">☕ Penyesuaian Dosis Theophylline (TDM)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Kadar Teofilin Aktual (mcg/mL)</label>
              <input type="number" step="0.1" value={theoLevel} onChange={(e) => setTheoLevel(e.target.value)} placeholder="6.0" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Dosis Harian Saat Ini (mg/hari)</label>
              <input type="number" value={theoDose} onChange={(e) => setTheoDose(e.target.value)} placeholder="600" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-500">Rekomendasi Dosis Baru:</span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{theoRec.newDose} mg/hari</span>
            </div>
            <p className="text-slate-400 italic text-[11px]">{theoRec.status}</p>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 4: WARFARIN */}
      {ntiSubTab === 'warfarin' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🩸 Penyesuaian Dosis Warfarin Berdasarkan INR</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Nilai INR Aktual Pasien</label>
              <input type="number" step="0.1" value={warfarinInr} onChange={(e) => setWarfarinInr(e.target.value)} placeholder="1.5" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Total Dosis Warfarin Mingguan (mg/minggu)</label>
              <input type="number" step="0.5" value={warfarinDoseWeekly} onChange={(e) => setWarfarinDoseWeekly(e.target.value)} placeholder="35" className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-500">Rekomendasi Dosis Baru Mingguan:</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{warfarinRec.newWeekly} mg/minggu</span>
            </div>
            <p className="text-slate-400 italic text-[11px]">{warfarinRec.action}</p>
          </div>
        </div>
      )}

      {/* KONTEN SUB-TAB 5: AMINOGLYCOSIDE */}
      {ntiSubTab === 'aminoglycoside' && (
        <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <h3 className="font-bold text-blue-500">🦠 Dosis Empiris Aminoglikosida (Amikacin / Gentamicin)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Jenis Obat</label>
              <select value={aminoDrug} onChange={(e) => setAminoDrug(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
                <option value="amikacin">Amikacin (15 mg/kg IBW)</option>
                <option value="gentamicin">Gentamicin (5-7 mg/kg IBW)</option>
              </select>
            </div>
            <div><label className="block mb-1 font-semibold">BB Aktual (kg)</label><input type="number" value={aminoWeight} onChange={(e) => setAminoWeight(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Tinggi Badan (cm)</label><input type="number" value={aminoHeight} onChange={(e) => setAminoHeight(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Usia (Tahun)</label><input type="number" value={aminoAge} onChange={(e) => setAminoAge(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Serum Creatinine (mg/dL)</label><input type="number" step="0.1" value={aminoScr} onChange={(e) => setAminoScr(e.target.value)} className={`w-full p-2.5 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`} /></div>
            <div><label className="block mb-1 font-semibold">Jenis Kelamin</label><select value={aminoGender} onChange={(e) => setAminoGender(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-xs ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></div>
          </div>
          <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 flex justify-between items-center">
            <div>
              <span className="font-bold text-blue-500 block">Rekomendasi Dosis Empiris:</span>
              <span className="text-[10px] text-slate-400">IBW: {aminoCalc.ibw} kg | ClCr: {aminoCalc.clcr} mL/min</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{aminoCalc.recDose} mg / {aminoCalc.interval}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}